import type { DeviceTemplateConfig } from "@repo/config";

import type { RackDeviceRecord } from "@lib/rack-placement";

export type BoardPreset = {
  id: string;
  label: string;
  symbol: string;
};

export type BoardPanelKind = "racks" | "devices" | null;

export type ProjectRackSummary = {
  id: string;
  name: string;
  templateKey: "rack-42u" | "rack-20u";
  heightU: number;
};

export type PlacedBoardRack = {
  id: string;
  rack: ProjectRackSummary;
  x: number;
  y: number;
  devices: RackDeviceRecord[];
};

export type BoardDragState =
  | {
      kind: "new";
      rack: ProjectRackSummary;
      point: { x: number; y: number } | null;
      offset: { x: number; y: number };
      originClient: { x: number; y: number };
      didMove: boolean;
    }
  | {
      kind: "placed";
      rackId: string;
      rack: ProjectRackSummary;
      point: { x: number; y: number } | null;
      offset: { x: number; y: number };
    }
  | {
      kind: "device";
      device: DeviceTemplateConfig;
      point: { x: number; y: number } | null;
      offset: { x: number; y: number };
      originClient: { x: number; y: number };
      didMove: boolean;
    };

export const boardPresets: BoardPreset[] = [
  { id: "cursor", label: "Select", symbol: "↖" },
  { id: "racks", label: "Racks", symbol: "▥" },
  { id: "devices", label: "Devices", symbol: "◫" },
  { id: "connect", label: "Connect", symbol: "⌁" },
];

export const BOARD_VIEWBOX_WIDTH = 3200;
export const BOARD_VIEWBOX_HEIGHT = 1920;
