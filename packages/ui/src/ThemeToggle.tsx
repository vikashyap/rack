import type { ComponentPropsWithoutRef } from "react";

import { ControlGroup } from "./ControlGroup";

export type ThemeToggleProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onClick"
> & {
  theme: "dark" | "light";
  onToggle: () => void;
};

export function ThemeToggle({
  theme,
  onToggle,
  className,
  ...props
}: ThemeToggleProps) {
  return (
    <ControlGroup>
      <ControlGroup.Button
        onClick={onToggle}
        aria-label="Toggle theme"
        className={className ?? "h-8 w-8 px-0 py-0"}
        {...props}
      >
        {theme === "dark" ? "☼" : "☾"}
      </ControlGroup.Button>
    </ControlGroup>
  );
}
