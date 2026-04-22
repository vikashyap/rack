import { ControlGroup, ThemeToggle } from "@repo/ui";

import { useThemeStore } from "@stores/themeStore";

export function BoardTopBar() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-end px-6 py-5">
      <div className="pointer-events-auto flex items-center gap-2">
        <ControlGroup>
          <ControlGroup.Button active>Board</ControlGroup.Button>
          <ControlGroup.Button>Team</ControlGroup.Button>
        </ControlGroup>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </div>
  );
}
