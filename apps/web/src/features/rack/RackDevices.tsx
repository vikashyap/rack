import { memo, type MouseEvent } from "react";

import { DeviceTemplate } from "@repo/ui";

import { useRackDrag } from "@hooks";
import { getRackDeviceY, type RackDevice } from "@lib/rack-placement";
import { useRackInteractionStore } from "@stores/rackInteractionStore";

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
  devices,
  onRemoveDevice,
}: {
  device: RackDevice;
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
  devices: RackDevice[];
  onRemoveDevice: (deviceId: string) => void;
}) {
  const deviceWidth = width - railWidth * 2;
  const y = getRackDeviceY(device.startU, device.uHeight, rackHeight, uHeight);
  const activeDrag = useRackInteractionStore((state) => state.interaction.activeDrag);
  const active = activeDrag?.kind === "rack-device" && activeDrag.id === device.id;
  const bind = useRackDrag(
    { kind: "rack-device", id: device.id },
    { templates: devices, devices },
  );

  function handleDoubleClick(event: MouseEvent<SVGGElement>) {
    event.stopPropagation();
    onRemoveDevice(device.id);
  }

  return (
    <g
      {...bind()}
      onDoubleClick={handleDoubleClick}
      data-device-id={device.id}
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
  const view = useRackInteractionStore((state) => state.interaction.view);
  const visibleDevices = devices.filter((device) => device.view === view);

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
            devices={devices}
            onRemoveDevice={onRemoveDevice}
          />
        ))}
    </g>
  );
});
