import type { DeviceTemplateConfig } from "@repo/config";
import type { RackView } from "@repo/ui";

export type RackDevice = DeviceTemplateConfig & {
  startU: number;
  view: RackView;
};

export type RackDevicePreview = RackDevice & {
  isValid: boolean;
};

export function getRackDeviceY(
  startU: number,
  uHeight: number,
  rackHeight: number,
) {
  return (rackHeight - (startU + uHeight - 1)) * uHeight;
}

export function getStartUFromClientY({
  clientY,
  rackTop,
  rackRenderedHeight,
  rackHeight,
}: {
  clientY: number;
  rackTop: number;
  rackRenderedHeight: number;
  rackHeight: number;
}) {
  const localY = clientY - rackTop;
  const rowHeight = rackRenderedHeight / rackHeight;
  const rowIndex = Math.floor(localY / rowHeight);
  return rackHeight - rowIndex;
}

export function canPlaceRackDevice(
  devices: RackDevice[],
  candidate: Pick<RackDevice, "id" | "startU" | "uHeight" | "view">,
  rackHeight = 42,
) {
  const candidateEndU = candidate.startU + candidate.uHeight - 1;

  if (candidate.startU < 1 || candidateEndU > rackHeight) {
    return false;
  }

  return devices.every((device) => {
    if (device.view !== candidate.view) {
      return true;
    }

    if (device.id === candidate.id) {
      return true;
    }

    const deviceEndU = device.startU + device.uHeight - 1;
    return candidateEndU < device.startU || candidate.startU > deviceEndU;
  });
}
