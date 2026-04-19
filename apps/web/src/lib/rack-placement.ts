import type { DeviceTemplateConfig, DeviceTemplateKey } from "@repo/config";
import type { RackView } from "@repo/ui";

export type RackDeviceRecord = {
  id: string;
  templateKey: DeviceTemplateKey;
  startU: number;
  view: RackView;
};

export type RackDevice = DeviceTemplateConfig &
  RackDeviceRecord & {
    uHeight: number;
  };

export type RackDevicePreview = RackDevice & {
  isValid: boolean;
};

export function createRackDeviceRecord(
  device: Pick<RackDeviceRecord, "templateKey" | "startU" | "view">,
  id: string = crypto.randomUUID(),
): RackDeviceRecord {
  return {
    id,
    templateKey: device.templateKey,
    startU: device.startU,
    view: device.view,
  };
}

export function resolveRackDevices(
  deviceRecords: RackDeviceRecord[],
  templates: DeviceTemplateConfig[],
): RackDevice[] {
  const templateByKey = new Map(templates.map((template) => [template.templateKey, template] as const));

  return deviceRecords.flatMap((record) => {
    const template = templateByKey.get(record.templateKey);

    if (!template) {
      return [];
    }

    return [
      {
        ...template,
        ...record,
        uHeight: template.uHeight,
      },
    ];
  });
}

export function getRackDeviceY(
  startU: number,
  uHeight: number,
  rackHeight: number,
) {
  return (rackHeight - (startU + uHeight - 1)) * uHeight;
}

export function getRackStartUFromPoint(point: { x: number; y: number }) {
  if (typeof document === "undefined") {
    return null;
  }

  const rowElement = document
    .elementsFromPoint(point.x, point.y)
    .map((element) => element.closest("[data-rack-u]"))
    .find((element): element is Element => Boolean(element));

  const value = rowElement?.getAttribute("data-rack-u");
  const startU = value ? Number(value) : null;

  return startU && Number.isFinite(startU) ? startU : null;
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
