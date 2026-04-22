import type { PointerEvent as ReactPointerEvent } from "react";

import type { DeviceTemplateConfig } from "@repo/config";
import { FloatingPanel } from "@repo/ui";

import type { BoardPanelKind, ProjectRackSummary } from "./boardTypes";

function SidebarItem({
  title,
  subtitle,
  badgeText,
  isDraggable,
  onPointerDown,
}: {
  title: string;
  subtitle: string;
  badgeText: string;
  isDraggable?: boolean;
  onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  const content = (
    <>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ui-text-strong">
          {title}
        </div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ui-surface-subtitle">
          {subtitle}
        </div>
      </div>
      <div className="whitespace-nowrap rounded-full border border-ui-surface-border-soft bg-ui-surface-bg px-2.5 py-1 text-[11px] font-semibold text-ui-text-strong">
        {badgeText}
      </div>
    </>
  );

  if (isDraggable) {
    return (
      <button
        type="button"
        onPointerDown={onPointerDown}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-ui-surface-border-soft bg-ui-surface-accent px-3 py-2.5 text-left transition hover:bg-ui-control-item-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface-bg"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ui-surface-border-soft bg-ui-surface-accent px-3 py-2.5">
      {content}
    </div>
  );
}

export function BoardSidebarPanel({
  activePanel,
  devices,
  onDeviceDragStart,
  onClose,
  onRackDragStart,
  racks,
}: {
  activePanel: BoardPanelKind;
  devices: DeviceTemplateConfig[];
  onDeviceDragStart: (
    device: DeviceTemplateConfig,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  onClose: () => void;
  onRackDragStart: (
    rack: ProjectRackSummary,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  racks: ProjectRackSummary[];
}) {
  if (!activePanel) {
    return null;
  }

  const isRacks = activePanel === "racks";

  return (
    <div className="pointer-events-none absolute left-[5.75rem] top-24 z-20 w-[20rem]">
      <FloatingPanel
        open
        onClose={onClose}
        heading={isRacks ? "Project Racks" : "Project Devices"}
        subheading={
          isRacks
            ? "Drag racks onto the board."
            : "Drag devices into placed racks only."
        }
      >
        <div className="max-h-[22rem] space-y-2 overflow-y-auto custom-scrollbar">
          {isRacks
            ? racks.map((rack) => (
                <SidebarItem
                  key={rack.id}
                  title={rack.name}
                  subtitle={rack.templateKey}
                  badgeText={`${rack.heightU}U rack`}
                  isDraggable
                  onPointerDown={(event) => onRackDragStart(rack, event)}
                />
              ))
            : devices.map((device) => (
                <SidebarItem
                  key={device.id}
                  title={device.name}
                  subtitle={device.category}
                  badgeText={`${device.uHeight}U`}
                  isDraggable
                  onPointerDown={(event) => onDeviceDragStart(device, event)}
                />
              ))}
        </div>
      </FloatingPanel>
    </div>
  );
}
