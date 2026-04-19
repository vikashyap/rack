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
        "inline-flex items-center gap-[var(--ui-control-pad)] rounded-[var(--ui-control-radius)] border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] p-[var(--ui-control-pad)] backdrop-blur",
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
        "rounded-[var(--ui-control-item-radius)] px-[var(--ui-control-item-pad-x)] py-[var(--ui-control-item-pad-y)] text-[length:var(--ui-control-item-text-size)] font-semibold capitalize transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-status-online)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-surface-bg)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-[color:var(--ui-control-item-active-bg)] text-[color:var(--ui-control-item-active-fg)] shadow-sm"
          : "text-[color:var(--ui-control-item-idle-fg)] hover:bg-[color:var(--ui-control-item-hover-bg)] hover:text-[color:var(--ui-text-strong)]",
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
        "min-w-14 px-2 text-center text-xs font-medium tabular-nums text-[color:var(--ui-control-value-color)]",
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
