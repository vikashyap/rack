import { memo } from "react";

import type { DeviceTemplateConfig } from "@repo/config";
import { Panel } from "@repo/ui";

import { useRackDrag } from "@hooks";
import type { RackDevice } from "@lib/rack-placement";

interface DeviceFrameProps {
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
}

function formatCategory(category: DeviceTemplateConfig["category"]) {
  return category.replace("-", " ");
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
        className="cursor-grab select-none touch-none rounded-[1rem] border border-ui-surface-border-soft bg-ui-surface-bg-strong p-3 text-left transition duration-150 hover:border-ui-surface-border active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ui-text-strong">
              {template.name}
            </div>
            <div className="mt-1 text-xs capitalize text-ui-surface-subtitle">
              {formatCategory(template.category)}
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-ui-surface-border-soft bg-ui-surface-bg px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ui-surface-subtitle">
            {template.uHeight}U
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-ui-surface-subtitle">
          <span>{template.ports.length} ports</span>
          <span className="text-ui-surface-border">•</span>
          <span className="capitalize">{formatCategory(template.category)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.ports.slice(0, 4).map((port) => (
            <span
              key={port.id}
              className="rounded-full border border-ui-surface-border-soft bg-ui-surface-bg px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ui-surface-subtitle"
            >
              {port.type}
            </span>
          ))}
          {template.ports.length > 4 ? (
            <span className="rounded-full border border-ui-surface-border-soft bg-ui-surface-bg px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ui-surface-subtitle">
              +{template.ports.length - 4}
            </span>
          ) : null}
        </div>
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
