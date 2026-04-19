import type { DeviceTemplateConfig } from "@repo/config";

import type { RackDevice } from "./rack-placement";

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

export function fetchRackDevices() {
  return fetchJson<RackDevice[]>("/rack-devices");
}
