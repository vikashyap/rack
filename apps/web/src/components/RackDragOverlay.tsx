import { memo, useMemo } from "react";
import { DeviceTemplate } from "@repo/ui";
import { type DeviceTemplateConfig } from "@repo/config";
import { useRackInteractionStore } from "../stores/rackInteractionStore";
import { type RackDevice } from "../lib/rack-placement";
import { cn } from "../lib/cn";

interface RackDragOverlayProps {
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
}

export const RackDragOverlay = memo(function RackDragOverlay({
  templates,
  devices,
}: RackDragOverlayProps) {
  const activeDrag = useRackInteractionStore((state) => state.activeDrag);
  const point = useRackInteractionStore((state) => state.mousePoint);
  const preview = useRackInteractionStore((state) => state.preview);

  const item = useMemo(() => {
    if (!activeDrag) {
      return null;
    }

    if (activeDrag.kind === "template") {
      return templates.find((template) => template.id === activeDrag.id) ?? null;
    }

    return devices.find((device) => device.id === activeDrag.id) ?? null;
  }, [activeDrag, devices, templates]);

  if (!item || !point) return null;

  const uHeight = 28;
  const width = 360;
  const height = item.uHeight * uHeight;
  const isValid = preview?.isValid;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity"
      style={{
        transform: `translate3d(${point.x}px, ${point.y}px, 0)`,
      }}
    >
      <div
        className={cn(
          "absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-sm border shadow-2xl backdrop-blur-sm transition-all duration-200 scale-105",
          isValid === false
            ? "border-[color:var(--ui-status-invalid)]/60 bg-[color:var(--ui-status-invalid)]/10"
            : "border-[color:var(--ui-status-valid)]/50 bg-[color:var(--ui-status-valid)]/5"
        )}
        style={{
          width: width,
          height: height,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={cn(
            "h-auto w-full overflow-visible transition-all duration-200",
            isValid === false ? "opacity-70 grayscale" : "opacity-95 contrast-[1.05]"
          )}
        >
          <DeviceTemplate.Auto template={item} width={width} uHeight={uHeight} density="rack" />
        </svg>

        {/* Status Glow */}
        <div
          className={cn(
            "absolute inset-0 -z-10 translate-y-2 blur-2xl transition-colors duration-300",
            isValid === false
              ? "bg-[color:var(--ui-status-invalid)]/20"
              : "bg-[color:var(--ui-status-valid)]/15",
          )}
        />

        <div className="absolute -top-10 left-1/2 flex -translate-x-1/2 justify-center">
          <span
            className={cn(
              "rounded-md px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-transform duration-200",
              isValid === false
                ? "bg-[color:var(--ui-status-invalid)] animate-shake"
                : "bg-[color:var(--ui-status-valid)]",
            )}
          >
            {isValid === false ? "Blocked" : "Ready"}
          </span>
        </div>
      </div>
    </div >
  );
});
