import type { DeviceTemplateConfig } from "@repo/config";

import type { RackDeviceRecord } from "./rack-placement";
import type { RackConnection } from "./rack-wire";

const apiBase = "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchDevices() {
  return fetchJson<DeviceTemplateConfig[]>("/devices");
}

export type RackDocumentResponse = {
  rackId: string;
  revisionId: number;
  devices: RackDeviceRecord[];
  connections: RackConnection[];
};

export function fetchRackDocument() {
  return fetchJson<RackDocumentResponse>("/rack-document");
}
