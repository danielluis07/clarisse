import type { LucideIcon } from "lucide-react";

export const AccountEmpty = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-foreground/15 px-6 py-20 text-center">
      <div className="flex size-12 items-center justify-center border border-foreground/15 text-foreground/55">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-6 font-heading text-xl font-light tracking-tight">
        {title}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/60">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
};
