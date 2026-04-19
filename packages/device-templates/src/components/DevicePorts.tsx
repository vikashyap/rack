import { EthernetPort, Radio, Terminal, Zap } from "lucide-react";

import type { DevicePortType, DeviceTemplateClassNames } from "@repo/config";

import { cn } from "../lib/cn";
import type { DevicePortLayout } from "../lib/device-port-layout";

type DevicePortsProps = {
  layout: DevicePortLayout;
  density?: "compact" | "rack";
  classNames?: Partial<DeviceTemplateClassNames>;
};

const portIconMap = {
  ethernet: EthernetPort,
  fiber: Radio,
  console: Terminal,
  power: Zap,
} satisfies Record<DevicePortType, typeof EthernetPort>;

export function DevicePorts({
  layout,
  density = "rack",
  classNames,
}: DevicePortsProps) {
  const iconSize = density === "compact" ? layout.portHeight - 5 : layout.portHeight - 4;

  return (
    <g>
      {layout.ports.map((port, index) => {
        const portX = layout.startX - (index + 1) * layout.gap;
        const Icon = portIconMap[port.type];

        return (
          <g
            key={port.id}
            data-port-id={port.id}
            data-port-type={port.type}
            className="cursor-pointer group/port"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Base Shell */}
            <rect
              x={portX}
              y={layout.portY}
              width={layout.portWidth}
              height={layout.portHeight}
              rx={density === "compact" ? 3.5 : 4}
              className={cn(
                "fill-ui-port-shell-bg stroke-ui-port-shell-border shadow-ui-port-shell transition-[stroke,fill,transform] duration-200 group-hover/port:stroke-ui-device-accent",
                classNames?.portShell,
              )}
            />
            <rect
              x={portX + 1}
              y={layout.portY + 1}
              width={layout.portWidth - 2}
              height={layout.portHeight - 2}
              rx={density === "compact" ? 2.5 : 3}
              className="pointer-events-none fill-white/5"
            />
            <Icon
              x={portX + 2}
              y={layout.portY + 2}
              width={layout.portWidth - 4}
              height={iconSize}
              size={iconSize}
              strokeWidth={density === "compact" ? 2.2 : 2.35}
              absoluteStrokeWidth
              className={cn(
                "pointer-events-none transition-colors duration-200 text-ui-device-label group-hover/port:text-ui-device-accent",
              )}
            />
          </g>
        );
      })}
    </g>
  );
}
