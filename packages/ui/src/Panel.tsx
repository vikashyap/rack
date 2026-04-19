import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "./lib/cn";

type PanelTone = "default" | "muted";

type PanelBaseProps = ComponentPropsWithoutRef<"section"> & {
  tone?: PanelTone;
};

type PanelSlotProps = ComponentPropsWithoutRef<"div">;
type PanelTextProps = ComponentPropsWithoutRef<"p">;

const PanelRoot = forwardRef<HTMLElement, PanelBaseProps>(function PanelRoot(
  { tone = "default", className, children, ...props },
  ref,
) {
  return (
    <section
      ref={ref as never}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--ui-surface-border)] bg-[color:var(--ui-surface-bg)] shadow-[var(--ui-surface-shadow)] backdrop-blur",
        tone === "muted" && "bg-[color:var(--ui-surface-bg-strong)]",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
});

function PanelHeader({ className, ...props }: PanelSlotProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-[color:var(--ui-surface-border-soft)] px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

function PanelBody({ className, ...props }: PanelSlotProps) {
  return (
    <div
      className={cn("min-h-0 flex-1 px-5 py-4", className)}
      {...props}
    />
  );
}

function PanelFooter({ className, ...props }: PanelSlotProps) {
  return (
    <div
      className={cn(
        "border-t border-[color:var(--ui-surface-border-soft)] px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: PanelTextProps) {
  return (
    <p
      className={cn(
        "text-[length:var(--ui-surface-title-size)] font-semibold tracking-tight text-[color:var(--ui-text-strong)]",
        className,
      )}
      {...props}
    />
  );
}

function PanelDescription({ className, ...props }: PanelTextProps) {
  return (
    <p
      className={cn(
        "text-[length:var(--ui-surface-subtitle-size)] text-[color:var(--ui-surface-subtitle-color)]",
        className,
      )}
      {...props}
    />
  );
}

export const Panel = Object.assign(PanelRoot, {
  Body: PanelBody,
  Description: PanelDescription,
  Footer: PanelFooter,
  Header: PanelHeader,
  Title: PanelTitle,
});
