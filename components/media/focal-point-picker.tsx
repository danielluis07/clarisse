"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { clampFocalCoord } from "@/modules/banners/hero-layout";
import type { FocalPoint } from "@/modules/media/types";

/**
 * Shopify-style focal point picker. Shows the *full* image and lets the
 * merchant click/drag (or arrow-key) to mark the point that must stay visible
 * when the storefront crops the image to the hero box. The value is a percent
 * pair consumed as `object-position` on the live hero.
 */
export const FocalPointPicker = ({
  imageUrl,
  alt,
  value,
  onChange,
  disabled = false,
  className,
}: {
  imageUrl: string;
  alt: string;
  value: FocalPoint;
  onChange: (next: FocalPoint) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const labelId = React.useId();

  const setFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    onChange({
      x: clampFocalCoord(((event.clientX - rect.left) / rect.width) * 100),
      y: clampFocalCoord(((event.clientY - rect.top) / rect.height) * 100),
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    setFromPointer(event);
  };

  const nudge = (dx: number, dy: number) =>
    onChange({
      x: clampFocalCoord(value.x + dx),
      y: clampFocalCoord(value.y + dy),
    });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const step = event.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    nudge(move[0], move[1]);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex justify-center">
        <div
          role="group"
          aria-labelledby={labelId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className={cn(
            "relative inline-block max-w-full cursor-crosshair touch-none overflow-hidden rounded-md border bg-muted",
            disabled && "pointer-events-none opacity-60",
          )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            draggable={false}
            className="block max-h-65 w-auto max-w-full select-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px bg-white mix-blend-difference"
            style={{ left: `${value.x}%` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-px bg-white mix-blend-difference"
            style={{ top: `${value.y}%` }}
          />
          <button
            type="button"
            aria-labelledby={labelId}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            style={{ left: `${value.x}%`, top: `${value.y}%` }}
            className="absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/25 shadow-[0_0_0_1.5px_rgba(0,0,0,0.55)] outline-none backdrop-blur-[1px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </div>
      </div>
      <p id={labelId} className="text-xs text-muted-foreground">
        Ponto focal — clique ou arraste para escolher o que permanece visível ao
        recortar ({Math.round(value.x)}% · {Math.round(value.y)}%)
      </p>
    </div>
  );
};
