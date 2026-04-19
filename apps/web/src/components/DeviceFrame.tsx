import { memo, useMemo } from "react";

import type { DeviceTemplateConfig } from "@repo/config";
import { DeviceTemplate, Panel } from "@repo/ui";

import { useGestureDrag, type GesturePoint } from "../hooks";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

interface DeviceFrameProps {
  templates: DeviceTemplateConfig[];
}

const DeviceCard = memo(function DeviceCard({
  template,
}: {
  template: DeviceTemplateConfig;
}) {
  const startDrag = useRackInteractionStore((state) => state.startDrag);
  const moveDrag = useRackInteractionStore((state) => state.moveDrag);
  const endDrag = useRackInteractionStore((state) => state.endDrag);

  const dragHandlers = useMemo(
    () => ({
      onDragStart: startDrag,
      onDragMove: (_: unknown, point: GesturePoint) => moveDrag(point),
      onDragEnd: (_: unknown, point: GesturePoint) => endDrag(point),
    }),
    [endDrag, moveDrag, startDrag],
  );

  const bind = useGestureDrag(
    { kind: "template" as const, id: template.id },
    dragHandlers,
  );

  return (
    <Panel tone="muted" className="overflow-visible p-2">
      <div
        {...bind()}
        className="cursor-grab select-none touch-none text-left transition duration-150 active:cursor-grabbing"
      >
        <svg
          viewBox={`0 0 180 ${Math.max(40, template.uHeight * 18 + 24)}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={template.name}
        >
          <DeviceTemplate.Auto template={template} width={180} uHeight={18} density="compact" />
        </svg>
      </div>
    </Panel>
  );
});

export const DeviceFrame = memo(function DeviceFrame({ templates }: DeviceFrameProps) {
  return (
    <Panel tone="muted" className="min-h-0 overflow-auto">
      <Panel.Header>
        <div>
          <Panel.Title>Devices</Panel.Title>
          <Panel.Description>Inventory</Panel.Description>
        </div>
      </Panel.Header>

      <Panel.Body className="grid gap-2">
        {templates.map((template) => (
          <DeviceCard key={template.id} template={template} />
        ))}
      </Panel.Body>
    </Panel>
  );
});
