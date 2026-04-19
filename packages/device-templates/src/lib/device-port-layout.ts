import type { DeviceCategory, DevicePortConfig, DeviceTemplateConfig } from "@repo/config";

import { resolveTemplatePorts } from "./resolvePorts";

type DevicePortLayoutSpec = {
  compactCount: number;
  rackCount: number;
  compactGap?: number;
  rackGap?: number;
  startXOffset?: number;
};

const devicePortLayoutSpecByCategory: Record<DeviceCategory, DevicePortLayoutSpec> = {
  server: {
    compactCount: 3,
    rackCount: 6,
    rackGap: 26,
    startXOffset: 16,
  },
  switch: {
    compactCount: 6,
    rackCount: 12,
    rackGap: 30,
  },
  router: {
    compactCount: 4,
    rackCount: 8,
  },
  "patch-panel": {
    compactCount: 6,
    rackCount: 12,
    compactGap: 16,
    rackGap: 24,
  },
  pdu: {
    compactCount: 4,
    rackCount: 8,
    rackGap: 32,
    startXOffset: 12,
  },
  firewall: {
    compactCount: 4,
    rackCount: 8,
  },
};

const compactPortSize = {
  width: 15,
  height: 12,
} as const;

const rackPortSize = {
  width: 18,
  height: 14,
} as const;

const defaultCompactGap = 18;
const defaultRackGap = 28;
const defaultStartXOffset = 14;

export type DevicePortLayout = {
  ports: DevicePortConfig[];
  startX: number;
  gap: number;
  portY: number;
  portWidth: number;
  portHeight: number;
};

export function resolveDevicePortLayout(
  template: DeviceTemplateConfig,
  width: number,
  uHeight: number,
  density: "compact" | "rack" = "rack",
): DevicePortLayout {
  const spec = devicePortLayoutSpecByCategory[template.category];
  const height = template.uHeight * uHeight;
  const visibleCount = density === "compact" ? spec.compactCount : spec.rackCount;
  const portSize = density === "compact" ? compactPortSize : rackPortSize;

  return {
    ports: resolveTemplatePorts(template).slice(0, visibleCount),
    startX: width - (spec.startXOffset ?? defaultStartXOffset),
    gap:
      density === "compact"
        ? spec.compactGap ?? defaultCompactGap
        : spec.rackGap ?? defaultRackGap,
    portY: density === "compact" ? height + 6 : height - portSize.height - 6,
    portWidth: portSize.width,
    portHeight: portSize.height,
  };
}

export function resolveDevicePortAnchor(
  layout: DevicePortLayout,
  portId: string,
): {
  port: DevicePortConfig;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  const index = layout.ports.findIndex((port) => port.id === portId);

  if (index < 0) {
    return null;
  }

  return {
    port: layout.ports[index],
    index,
    x: layout.startX - (index + 1) * layout.gap,
    y: layout.portY,
    width: layout.portWidth,
    height: layout.portHeight,
  };
}
