import { Router } from "lucide-react";

import { cn } from "../lib/cn";
import {
  type DeviceTemplateProps,
} from "@repo/config";
import { DevicePorts } from "../components/DevicePorts";
import { resolveTemplatePorts } from "../lib/resolvePorts";

export function RouterDeviceTemplate({
  template,
  width,
  uHeight,
  density = "rack",
  label = template.name,
  className,
  classNames,
  ...props
}: DeviceTemplateProps) {
  const height = template.uHeight * uHeight;
  const compact = density === "compact";
  const visiblePorts = resolveTemplatePorts(template).slice(0, compact ? 4 : 8);
  const portSize = compact ? 15 : 18;
  const portGap = compact ? 18 : 28;
  const portHeight = compact ? 12 : 14;
  const portY = compact ? height + 6 : height - portHeight - 6;

  return (
    <g className={className} data-category={template.category} {...props}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={4}
        className={cn(
          "fill-ui-device-body stroke-ui-device-border stroke-[1]",
          classNames?.body,
        )}
      />
      <rect
        x={0}
        y={0}
        width={4}
        height={height}
        rx={4}
        className={cn("fill-ui-device-accent", classNames?.accent)}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={compact ? 5 : 7}
        rx={4}
        className={cn("fill-ui-device-highlight", classNames?.highlight)}
      />

      <g transform={`translate(${compact ? 7 : 9}, ${compact ? 5 : 7})`}>
        <Router
          className="text-ui-device-accent opacity-80"
          size={compact ? 10 : 12}
          strokeWidth={2.15}
        />
      </g>

      <text
        x={compact ? 20 : 24}
        y={compact ? Math.min(10, height / 2 + 2) : Math.min(11, height / 2 + 3)}
        className={cn(
          "fill-ui-device-label font-sans antialiased",
          classNames?.label,
          "opacity-95",
        )}
        fontSize={compact ? 8.75 : 10.25}
        fontWeight={800}
        letterSpacing={"0.01em"}
      >
        {label}
      </text>

      <DevicePorts
        ports={visiblePorts}
        startX={width - 14}
        gap={portGap}
        portY={portY}
        portWidth={portSize}
        density={density}
        classNames={classNames}
      />
    </g>
  );
}
