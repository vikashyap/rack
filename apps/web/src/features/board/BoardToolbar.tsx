import { Panel } from "@repo/ui";

import { cn } from "@lib/cn";

import { boardPresets, type BoardPanelKind } from "./boardTypes";

export function BoardToolbar({
  activePanel,
  onSelectPanel,
}: {
  activePanel: BoardPanelKind;
  onSelectPanel: (panel: BoardPanelKind) => void;
}) {
  return (
    <div className="pointer-events-none absolute left-6 top-24 z-20 flex flex-col gap-3">
      <Panel className="pointer-events-auto overflow-visible">
        <Panel.Body className="flex flex-col gap-2 px-2 py-2">
          {boardPresets.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => {
                if (item.id === "racks" || item.id === "devices") {
                  onSelectPanel(activePanel === item.id ? null : item.id);
                }
              }}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface-bg",
                activePanel === item.id || (item.id === "cursor" && !activePanel)
                  ? "bg-ui-control-item-active-bg text-ui-control-item-active-fg shadow-sm"
                  : "text-ui-control-item-idle-fg hover:bg-ui-control-item-hover-bg hover:text-ui-text-strong",
              )}
            >
              {item.symbol}
            </button>
          ))}
        </Panel.Body>
      </Panel>
    </div>
  );
}
