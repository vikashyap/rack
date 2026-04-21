import type { RackView } from "@repo/ui";

import type { RackDeviceRecord } from "./rack-placement";
import type { RackConnection } from "./rack-wire";

export type RackCollaborationStatus = "connecting" | "connected" | "disconnected";

export type RackCollaboratorPointer = {
  x: number;
  y: number;
  view: RackView;
};

export type RackCollaboratorDragPreview = {
  heightU: number;
  isValid: boolean;
  name: string;
  startU: number;
  view: RackView;
};

export type RackCollaborator = {
  id: string;
  name: string;
  color: string;
  dragPreview: RackCollaboratorDragPreview | null;
  pointer: RackCollaboratorPointer | null;
};

export type RackCollaborationConnection = {
  session: RackCollaborator;
  sendPresence: (presence: {
    dragPreview: RackCollaboratorDragPreview | null;
    pointer: RackCollaboratorPointer | null;
  }) => void;
};

export type RackDocumentOperation =
  | {
      type: "device.added";
      rackId: string;
      revisionId: number;
      device: RackDeviceRecord;
    }
  | {
      type: "device.moved";
      rackId: string;
      revisionId: number;
      deviceId: string;
      startU: number;
    }
  | {
      type: "device.removed";
      rackId: string;
      revisionId: number;
      deviceId: string;
    }
  | {
      type: "connection.added";
      rackId: string;
      revisionId: number;
      connection: RackConnection;
    }
  | {
      type: "connection.removed";
      rackId: string;
      revisionId: number;
      connectionId: string;
    };

export type RackCollaborationMessage = {
  type: "users";
  users: RackCollaborator[];
} | {
  type: "operation";
  operation: RackDocumentOperation;
};

export function getRackCollaborationUrl(session: RackCollaborator) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const params = new URLSearchParams({
    color: session.color,
    name: session.name,
    sessionId: session.id,
  });

  return `${protocol}//${window.location.host}/ws?${params.toString()}`;
}

const userColors = ["#38bdf8", "#a3e635", "#f97316", "#f472b6", "#c084fc"];

export function getBrowserRackSession(): RackCollaborator {
  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get("user");
  const id = crypto.randomUUID();
  const name = nameFromUrl || `User ${Math.floor(Math.random() * 90) + 10}`;
  const color = userColors[Math.floor(Math.random() * userColors.length)];

  return {
    id,
    name,
    color,
    dragPreview: null,
    pointer: null,
  };
}
