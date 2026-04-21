import type { ComponentPropsWithoutRef } from "react";

import { cn } from "./lib/cn";

type PageHeaderRootProps = ComponentPropsWithoutRef<"header">;
type PageHeaderContentProps = ComponentPropsWithoutRef<"div">;
type PageHeaderTitleProps = ComponentPropsWithoutRef<"p">;
type PageHeaderDescriptionProps = ComponentPropsWithoutRef<"p">;
type PageHeaderActionsProps = ComponentPropsWithoutRef<"div">;

function PageHeaderRoot({ className, ...props }: PageHeaderRootProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ui-surface-border bg-ui-surface-bg shadow-ui-surface ring-1 ring-inset ring-white/10 backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderContent({ className, ...props }: PageHeaderContentProps) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

function PageHeaderTitle({ className, ...props }: PageHeaderTitleProps) {
  return (
    <p
      className={cn(
        "text-base font-semibold tracking-tight text-ui-text-strong",
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-ui-surface-subtitle", className)}
      {...props}
    />
  );
}

function PageHeaderActions({ className, ...props }: PageHeaderActionsProps) {
  return (
    <div
      className={cn("flex items-center gap-2 px-5 py-4", className)}
      {...props}
    />
  );
}

export const PageHeader = Object.assign(PageHeaderRoot, {
  Actions: PageHeaderActions,
  Content: PageHeaderContent,
  Description: PageHeaderDescription,
  Title: PageHeaderTitle,
});
