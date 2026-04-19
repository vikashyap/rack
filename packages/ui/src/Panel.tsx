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
        "flex min-h-0 flex-col overflow-hidden rounded-ui-surface border border-ui-surface-border bg-ui-surface-bg shadow-ui-surface ring-1 ring-inset ring-white/10 backdrop-blur-xl",
        tone === "muted" && "bg-ui-surface-bg-strong",
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
        "flex items-center justify-between gap-3 border-b border-ui-surface-border-soft px-ui-surface-pad-x py-ui-surface-pad-y",
        className,
      )}
      {...props}
    />
  );
}

function PanelBody({ className, ...props }: PanelSlotProps) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 px-ui-surface-pad-x py-ui-surface-body-pad-y",
        className,
      )}
      {...props}
    />
  );
}

function PanelFooter({ className, ...props }: PanelSlotProps) {
  return (
    <div
      className={cn(
        "border-t border-ui-surface-border-soft px-ui-surface-pad-x py-ui-surface-pad-y",
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
        "text-ui-surface-title-size font-semibold tracking-tight text-ui-text-strong",
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
        "text-ui-surface-subtitle-size text-ui-surface-subtitle",
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
