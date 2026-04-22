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

export type ProjectSummary = {
  id: string;
  name: string;
  description: string;
  rackCount: number;
  deviceCatalogCount: number;
  racks: Array<{
    id: string;
    name: string;
    templateKey: "rack-42u" | "rack-20u";
    heightU: number;
  }>;
};

export function fetchProjects() {
  return fetchJson<ProjectSummary[]>("/projects");
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
