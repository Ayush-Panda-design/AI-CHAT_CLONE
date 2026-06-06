import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AduraAI – Intelligent Conversations</title>
        <meta name="description" content="Production-grade AI chat powered by OpenRouter" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            {children}
            <Toaster
              theme="dark"
              toastOptions={{
                style: { background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", color: "hsl(0 0% 96%)" },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
