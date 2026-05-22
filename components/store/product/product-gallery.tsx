"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

export const ProductGallery = ({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowRight")
        setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, images.length]);

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % images.length);

  const activeSrc = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative mx-auto w-full max-w-130">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label="Ampliar imagem"
          className="group relative block aspect-3/4 w-full overflow-hidden bg-foreground/3">
          <Image
            key={activeSrc}
            src={activeSrc}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />

          <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 bg-background/85 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-foreground/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <ZoomIn className="size-3" /> Ampliar
          </span>

          <span className="pointer-events-none absolute bottom-4 right-4 text-[10px] tabular-nums uppercase tracking-[0.22em] text-foreground/55">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={goPrev}
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center bg-background/85 p-2 text-foreground/70 transition-colors hover:text-foreground md:inline-flex">
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={goNext}
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center bg-background/85 p-2 text-foreground/70 transition-colors hover:text-foreground md:inline-flex">
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-130 gap-3 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`Ver imagem ${i + 1}`}
            aria-current={i === activeIndex}
            className={cn(
              "relative aspect-3/4 w-20 shrink-0 overflow-hidden bg-foreground/3 transition-opacity",
              i === activeIndex
                ? "opacity-100 outline outline-foreground"
                : "opacity-70 hover:opacity-100",
            )}>
            <Image
              src={src}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {zoomOpen && (
        <ZoomModal
          src={activeSrc}
          alt={alt}
          total={images.length}
          index={activeIndex}
          onClose={() => setZoomOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  );
};

type ZoomModalProps = {
  src: string;
  alt: string;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const ZoomModal = ({
  src,
  alt,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: ZoomModalProps) => {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada"
      className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4 md:px-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/60">
          <span className="tabular-nums">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
          <span className="mx-3 text-foreground/30">·</span>
          {zoomed ? "Mover para explorar" : "Clique para ampliar"}
        </span>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="text-foreground/70 transition-colors hover:text-foreground">
          <X className="size-5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 select-none overflow-hidden"
        onClick={() => setZoomed((v) => !v)}
        onMouseMove={handleMove}
        onMouseLeave={() => setOrigin({ x: 50, y: 50 })}
        style={{ cursor: zoomed ? "zoom-out" : "zoom-in" }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority
          className="object-contain transition-transform duration-300 ease-out"
          style={{
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: zoomed ? "scale(2.2)" : "scale(1)",
          }}
        />

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
                setZoomed(false);
                setOrigin({ x: 50, y: 50 });
              }}
              className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center bg-background/85 p-3 text-foreground/70 transition-colors hover:text-foreground md:left-10">
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
                setZoomed(false);
                setOrigin({ x: 50, y: 50 });
              }}
              className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center bg-background/85 p-3 text-foreground/70 transition-colors hover:text-foreground md:right-10">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        <span className="pointer-events-none absolute bottom-6 right-6 inline-flex items-center gap-2 bg-background/85 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-foreground/70">
          <Expand className="size-3" />
          {zoomed ? "100%" : "Padrão"}
        </span>
      </div>
    </div>
  );
};
