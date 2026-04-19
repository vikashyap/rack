import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./lib/cn";

type ControlGroupProps = ComponentPropsWithoutRef<"div">;
type ControlGroupButtonProps = ComponentPropsWithoutRef<"button"> & {
  active?: boolean;
};
type ControlGroupValueProps = ComponentPropsWithoutRef<"span">;

function ControlGroupRoot({ className, ...props }: ControlGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-ui-control-pad rounded-ui-control border border-ui-control-border bg-ui-control-bg p-ui-control-pad ring-1 ring-inset ring-white/10 backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

function ControlGroupButton({ active = false, className, ...props }: ControlGroupButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-ui-control-item px-ui-control-item-pad-x py-ui-control-item-pad-y text-ui-control-item-size font-semibold capitalize transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface-bg",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-ui-control-item-active-bg text-ui-control-item-active-fg shadow-sm"
          : "text-ui-control-item-idle-fg hover:bg-ui-control-item-hover-bg hover:text-ui-text-strong",
        className,
      )}
      {...props}
    />
  );
}

function ControlGroupValue({ className, ...props }: ControlGroupValueProps) {
  return (
    <span
      className={cn(
        "min-w-14 px-2 text-center text-xs font-medium tabular-nums text-ui-control-value-color",
        className,
      )}
      {...props}
    />
  );
}

export const ControlGroup = Object.assign(ControlGroupRoot, {
  Button: ControlGroupButton,
  Value: ControlGroupValue,
});
