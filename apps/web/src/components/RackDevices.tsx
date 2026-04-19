import { memo, useCallback, useMemo, type MouseEvent } from "react";

import { DeviceTemplate } from "@repo/ui";

import { useGestureDrag, type GesturePoint } from "../hooks";
import type { RackDevice } from "../lib/rack-placement";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

interface RackDevicesProps {
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
  devices: RackDevice[];
  onRemoveDevice: (deviceId: string) => void;
}

const RackDeviceItem = memo(function RackDeviceItem({
  device,
  rackHeight,
  uHeight,
  width,
  railWidth,
  onRemoveDevice,
}: {
  device: RackDevice;
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
  onRemoveDevice: (deviceId: string) => void;
}) {
  const deviceWidth = width - railWidth * 2;
  const y = (rackHeight - (device.startU + device.uHeight - 1)) * uHeight;
  const activeDrag = useRackInteractionStore((state) => state.activeDrag);
  const active = activeDrag?.kind === "rack-device" && activeDrag.id === device.id;

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

  const bind = useGestureDrag({ kind: "rack-device" as const, id: device.id }, dragHandlers);

  const handleDoubleClick = useCallback(
    (event: MouseEvent<SVGGElement>) => {
      event.stopPropagation();
      onRemoveDevice(device.id);
    },
    [device.id, onRemoveDevice],
  );

  return (
    <g
      {...bind()}
      onDoubleClick={handleDoubleClick}
      transform={`translate(${railWidth}, ${y})`}
      style={{
        cursor: active ? "grabbing" : "grab",
        opacity: active ? 0.45 : 1,
      }}
    >
      <rect x={0} y={0} width={deviceWidth} height={device.uHeight * uHeight} fill="transparent" />
      <DeviceTemplate.Auto template={device} width={deviceWidth} uHeight={uHeight} density="rack" />
    </g>
  );
});

export const RackDevices = memo(function RackDevices({
  rackHeight,
  uHeight,
  width,
  railWidth,
  devices,
  onRemoveDevice,
}: RackDevicesProps) {
  const view = useRackInteractionStore((state) => state.view);
  const visibleDevices = useMemo(
    () => devices.filter((device) => device.view === view),
    [devices, view],
  );

  return (
    <g>
      {visibleDevices.map((device) => (
          <RackDeviceItem
            key={device.id}
            device={device}
            rackHeight={rackHeight}
            uHeight={uHeight}
            width={width}
            railWidth={railWidth}
            onRemoveDevice={onRemoveDevice}
          />
        ))}
    </g>
  );
});
