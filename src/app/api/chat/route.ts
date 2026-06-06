export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_MODEL = "openrouter/free";
const MAX_HISTORY = 20;

const IMAGE_MODEL_KEYWORDS = [
  "stabilityai",
  "stable-diffusion",
  "flux",
  "dall-e",
  "image-gen",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the model string is an image-generation model.
 */
function isImageModel(model: string): boolean {
  const lower = model.toLowerCase();
  return IMAGE_MODEL_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Sanitises the model string: rejects invalid / legacy IDs and falls back
 * to a known-good free text model.
 */
function resolveModel(model?: string, chatModel?: string): string {
  const candidate = model || chatModel || FALLBACK_MODEL;

  // Never let a Pollinations placeholder reach OpenRouter
  if (!candidate || candidate === "pollinations/ai") {
    return FALLBACK_MODEL;
  }

  return candidate;
}

/**
 * Builds the messages array to send to OpenRouter.
 */
function buildMessages(
  history: { role: string; content: string }[],
  userContent: string | object
) {
  return [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userContent },
  ];
}

// ─── Image Generation Branch ──────────────────────────────────────────────────

async function handleImageGeneration(
  chatId: string,
  promptText: string,
  resolvedModel: string,
  chat: { title: string },
  content: string
): Promise<NextResponse> {
  
  let markdown = "";

  try {
    // Call Hugging Face Stable Diffusion
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: promptText || "A beautiful image",
          parameters: {
            num_inference_steps: 30,
            guidance_scale: 7.5,
          },
        }),
      }
    );

    if (hfRes.ok) {
      // HF returns raw image bytes — convert to base64
      const arrayBuffer = await hfRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      markdown = `![Generated Image](${dataUrl})`;
    } else {
      // Fallback to Pollinations if HF fails
      const encoded = encodeURIComponent(promptText || "A beautiful image");
      const seed = Math.floor(Math.random() * 100_000);
      markdown = `![Generated Image](https://image.pollinations.ai/prompt/${encoded}?nologo=true&seed=${seed}&width=1024&height=1024)`;
    }
  } catch {
    // Fallback to Pollinations on network error
    const encoded = encodeURIComponent(promptText || "A beautiful image");
    const seed = Math.floor(Math.random() * 100_000);
    markdown = `![Generated Image](https://image.pollinations.ai/prompt/${encoded}?nologo=true&seed=${seed}&width=1024&height=1024)`;
  }

  const encoder = new TextEncoder();
  const finalMarkdown = markdown;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ token: finalMarkdown })}\n\n`)
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));

      Message.create({
        chatId,
        role: "assistant",
        content: finalMarkdown,
        model: resolvedModel,
      })
        .then(async () => {
          if (chat.title === "New Chat") {
            await Chat.findByIdAndUpdate(chatId, {
              title: content.slice(0, 60).trim(),
              selectedModel: resolvedModel,
            });
          }
        })
        .catch(console.error)
        .finally(() => controller.close());
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  const authPayload = verifyAuth(req);
  if (!authPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const { chatId, content, model, image } = await req.json();
  if (!chatId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 3. DB setup
  await connectDB();

  const chat = await Chat.findOne({ _id: chatId, userId: authPayload.userId });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  // 4. Resolve model — sanitised, no "pollinations/ai" leaking through
  const resolvedModel = resolveModel(model, chat.selectedModel);

  // 5. Save user message
  await Message.create({ chatId, role: "user", content, model: resolvedModel });

  // 6. Fetch conversation history for context
  const rawHistory = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(MAX_HISTORY);

  const history = rawHistory.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 7. Build user content (text-only or multimodal with image)
  const userContent = image
    ? [
        { type: "text", text: content },
        { type: "image_url", image_url: { url: image } },
      ]
    : content;

  // 8. Image-generation shortcut — bypass OpenRouter entirely
  if (isImageModel(resolvedModel)) {
    const promptText =
      Array.isArray(userContent) ? userContent[0].text : userContent;

    return handleImageGeneration(
      chatId,
      promptText as string,
      resolvedModel,
      chat,
      content
    );
  }

  // 9. Build messages array for OpenRouter
  const messages = buildMessages(history, userContent);

  // 10. Call OpenRouter
  const openRouterRes = await fetch(
    `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL!,
        "X-Title": "NexusAI",
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages,
        stream: true,
      }),
    }
  );

  // 11. Handle OpenRouter errors
  if (!openRouterRes.ok) {
    const errText = await openRouterRes.text();
    let errBody: unknown = errText;
    try {
      errBody = JSON.parse(errText);
    } catch {
      // keep as plain text
    }

    console.error("OPENROUTER ERROR");
    console.error("STATUS:", openRouterRes.status);
    console.error("BODY:", errText);

    const errPayload =
      typeof errBody === "object" && errBody !== null && "error" in errBody
        ? errBody
        : { error: errBody };

    return NextResponse.json(errPayload, { status: openRouterRes.status });
  }

  // 12. Stream the response back to the client
  let fullContent = "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openRouterRes.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice("data: ".length).trim();

            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const token: string = parsed.choices?.[0]?.delta?.content ?? "";
              if (token) {
                fullContent += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
                );
              }
            } catch {
              // Ignore malformed SSE chunks
            }
          }
        }
      } finally {
        reader.releaseLock();

        // Persist assistant reply
        await Message.create({
          chatId,
          role: "assistant",
          content: fullContent,
          model: resolvedModel,
        });

        // Auto-title chat on first response
        if (chat.title === "New Chat" && fullContent) {
          await Chat.findByIdAndUpdate(chatId, {
            title: content.slice(0, 60).trim(),
            selectedModel: resolvedModel,
          });
        }

        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}