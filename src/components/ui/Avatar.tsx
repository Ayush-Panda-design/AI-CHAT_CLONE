"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
}

export function Avatar({
  src,
  name,
  size = 40,
  className,
  showStatus = false,
  status = "online",
}: AvatarProps) {
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AI";

  const statusColor = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    offline: "bg-zinc-500",
  };

  return (
    <div
      className={cn(
        "relative shrink-0 transition-all duration-300 hover:scale-105",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <div className="relative h-full w-full overflow-hidden rounded-2xl ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10">
          <Image
            src={src}
            alt={name || "Avatar"}
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        </div>
      ) : (
        <div
          className="
            flex h-full w-full items-center justify-center
            rounded-2xl
            bg-gradient-to-br
            from-cyan-500
            via-blue-500
            to-purple-600
            font-bold
            text-white
            shadow-lg
            shadow-cyan-500/20
            ring-2
            ring-white/10
            select-none
          "
        >
          <span
            style={{
              fontSize: Math.max(size * 0.32, 12),
            }}
          >
            {initials}
          </span>
        </div>
      )}

      {showStatus && (
        <div
          className={cn(
            "absolute bottom-0 right-0",
            "h-3.5 w-3.5 rounded-full border-2 border-zinc-950",
            statusColor[status]
          )}
        />
      )}
    </div>
  );
}