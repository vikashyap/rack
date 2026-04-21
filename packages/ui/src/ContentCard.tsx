import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "./lib/cn";

export interface ContentCardProps extends ComponentPropsWithoutRef<"article"> {
  title: string;
  subtitle?: string;
  preview?: ReactNode;
}

function ContentCardRoot({
  className,
  title,
  subtitle,
  preview,
  children,
  ...props
}: ContentCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[1.35rem] border border-ui-surface-border bg-ui-surface-bg shadow-ui-surface ring-1 ring-inset ring-white/10 transition hover:-translate-y-0.5 hover:border-ui-surface-border-soft hover:shadow-2xl",
        className,
      )}
      {...props}
    >
      <div className="border-b border-ui-surface-border-soft bg-ui-surface-bg-strong">
        {preview}
      </div>
      <div className="space-y-1 px-4 py-3">
        <div className="text-sm font-semibold text-ui-text-strong">{title}</div>
        {subtitle ? (
          <div className="text-xs text-ui-surface-subtitle">{subtitle}</div>
        ) : null}
        {children}
      </div>
    </article>
  );
}

export const ContentCard = ContentCardRoot;
