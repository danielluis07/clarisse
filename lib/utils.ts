import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import imageCompression from "browser-image-compression";
import type { ChangeEvent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSafeNextPath = (next: string | string[] | undefined) => {
  const value = Array.isArray(next) ? next[0] : next;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!value || !value.startsWith("/") || value.startsWith("//") || !appUrl) {
    return undefined;
  }

  try {
    const trustedOrigin = new URL(appUrl).origin;
    const url = new URL(value, trustedOrigin);

    if (url.origin !== trustedOrigin) {
      return undefined;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
};

export const compressImageToWebP = async (file: File) => {
  const compressionOptions = {
    maxSizeMB: 0.3, // 300kb
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  };

  const compressedBlob = await imageCompression(file, compressionOptions);

  const originalName = file.name;
  const lowerName = originalName.toLowerCase();
  const newFileName = lowerName.endsWith(".webp")
    ? originalName
    : originalName.includes(".")
      ? originalName.replace(/\.[^/.]+$/, ".webp")
      : `${originalName}.webp`;

  const finalImageFile = new File([compressedBlob], newFileName, {
    type: "image/webp",
  });

  return finalImageFile;
};

export function centsToReais(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export const formatReaisInput = (
  e: ChangeEvent<HTMLInputElement>,
  field: { onChange: (value: number) => void },
) => {
  const rawValue = e.target.value.replace(/\D/g, "");
  const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
  field.onChange(numericValue);
};

export const unique = (values: string[]) => Array.from(new Set(values));
