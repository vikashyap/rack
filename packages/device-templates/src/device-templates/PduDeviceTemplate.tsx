import { Zap } from "lucide-react";

import { cn } from "../lib/cn";
import {
  type DeviceTemplateProps,
} from "@repo/config";
import { DevicePorts } from "../components/DevicePorts";
import { resolveDevicePortLayout } from "../lib/device-port-layout";

export function PduDeviceTemplate({
  template,
  width,
  uHeight,
  density = "rack",
  label = template.name,
  className,
  classNames,
  ...props
}: DeviceTemplateProps) {
  const compact = density === "compact";
  const layout = resolveDevicePortLayout(template, width, uHeight, density);
  const height = template.uHeight * uHeight;

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
        <Zap
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
        layout={layout}
        density={density}
        classNames={classNames}
      />
    </g>
  );
}
