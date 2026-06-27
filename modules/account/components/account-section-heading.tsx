import type { ReactNode } from "react";

export const AccountSectionHeading = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/45">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 font-heading text-2xl font-light leading-tight tracking-tight md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/60">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
