import { memo } from "react";

import type { DeviceTemplateConfig } from "@repo/config";
import { DeviceTemplate, Panel } from "@repo/ui";

import { useRackDrag } from "../hooks";
import type { RackDevice } from "../lib/rack-placement";

interface DeviceFrameProps {
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
}

const DeviceCard = memo(function DeviceCard({
  template,
  templates,
  devices,
}: {
  template: DeviceTemplateConfig;
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
}) {
  const bind = useRackDrag(
    { kind: "template", id: template.id },
    { templates, devices },
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

export const DeviceFrame = memo(function DeviceFrame({
  templates,
  devices,
}: DeviceFrameProps) {
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
          <DeviceCard
            key={template.id}
            template={template}
            templates={templates}
            devices={devices}
          />
        ))}
      </Panel.Body>
    </Panel>
  );
});
