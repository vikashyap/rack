import { EthernetPort, Radio, Terminal, Zap } from "lucide-react";

import type { DevicePortConfig, DevicePortType, DeviceTemplateClassNames } from "@repo/config";

import { cn } from "../lib/cn";

type DevicePortsProps = {
  ports: DevicePortConfig[];
  startX: number;
  gap: number;
  portY: number;
  portWidth: number;
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
  ports,
  startX,
  gap,
  portY,
  portWidth,
  density = "rack",
  classNames,
}: DevicePortsProps) {
  const portHeight = density === "compact" ? 12 : 14;
  const iconSize = density === "compact" ? portHeight - 5 : portHeight - 4;

  return (
    <g>
      {ports.map((port, index) => {
        const portX = startX - (index + 1) * gap;
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
              y={portY}
              width={portWidth}
              height={portHeight}
              rx={density === "compact" ? 3.5 : 4}
              className={cn(
                "fill-ui-port-shell-bg stroke-ui-port-shell-border shadow-ui-port-shell transition-[stroke,fill,transform] duration-200 group-hover/port:stroke-ui-device-accent",
                classNames?.portShell,
              )}
            />
            <rect
              x={portX + 1}
              y={portY + 1}
              width={portWidth - 2}
              height={portHeight - 2}
              rx={density === "compact" ? 2.5 : 3}
              className="pointer-events-none fill-white/5"
            />
            <Icon
              x={portX + 2}
              y={portY + 2}
              width={portWidth - 4}
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
