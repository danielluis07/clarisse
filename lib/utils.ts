import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
