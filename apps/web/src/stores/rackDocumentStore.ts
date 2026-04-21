import { create } from "zustand";

import type { RackDocumentOperation } from "../lib/rack-collaboration";
import { sendRackDocumentOperation as emitRackDocumentOperation } from "../lib/rack-document-operations";
import type { RackConnection, RackConnectionEndpoint } from "../lib/rack-wire";
import type { RackDeviceRecord } from "../lib/rack-placement";
import type { RackDocumentResponse } from "../lib/api";

export type RackDocumentState = {
  rackId: string;
  revisionId: number;
  deviceIds: string[];
  devicesById: Record<string, RackDeviceRecord>;
  connectionIds: string[];
  connectionsById: Record<string, RackConnection>;
};

type RackMutationOptions = {
  revisionId?: number;
};

type RackDocumentStore = {
  document: RackDocumentState;
  seedDocument: (document: RackDocumentResponse) => void;
  addDevice: (device: RackDeviceRecord, options?: RackMutationOptions) => void;
  updateDeviceStartU: (
    deviceId: string,
    startU: number,
    options?: RackMutationOptions,
  ) => void;
  removeDevice: (deviceId: string, options?: RackMutationOptions) => void;
  connectPorts: (
    from: RackConnectionEndpoint,
    to: RackConnectionEndpoint,
    id?: string,
    options?: RackMutationOptions,
  ) => boolean;
  removeConnection: (connectionId: string, options?: RackMutationOptions) => void;
  removeConnectionsForDevice: (deviceId: string) => void;
};

const emptyDocument = (): RackDocumentState => ({
  rackId: "rack-main",
  revisionId: 1,
  deviceIds: [],
  devicesById: {},
  connectionIds: [],
  connectionsById: {},
});

function getNextRevisionId(
  currentRevisionId: number,
  options?: RackMutationOptions,
) {
  return options?.revisionId ?? currentRevisionId + 1;
}

function normalizeConnections(connections: RackConnection[]) {
  return {
    connectionIds: connections.map((connection) => connection.id),
    connectionsById: Object.fromEntries(
      connections.map((connection) => [connection.id, connection] as const),
    ),
  };
}

function normalizeDevices(devices: RackDeviceRecord[]) {
  return {
    deviceIds: devices.map((device) => device.id),
    devicesById: Object.fromEntries(devices.map((device) => [device.id, device] as const)),
  };
}

function isSameConnection(
  connection: RackConnection,
  from: RackConnectionEndpoint,
  to: RackConnectionEndpoint,
) {
  const sameDirection =
    connection.from.deviceId === from.deviceId &&
    connection.from.portId === from.portId &&
    connection.to.deviceId === to.deviceId &&
    connection.to.portId === to.portId;

  const reverseDirection =
    connection.from.deviceId === to.deviceId &&
    connection.from.portId === to.portId &&
    connection.to.deviceId === from.deviceId &&
    connection.to.portId === from.portId;

  return sameDirection || reverseDirection;
}

export const useRackDocumentStore = create<RackDocumentStore>((set) => ({
  document: emptyDocument(),
  seedDocument: ({ rackId, revisionId, devices, connections = [] }) => {
    set((state) => ({
      document: {
        ...state.document,
        rackId,
        revisionId,
        ...normalizeDevices(devices),
        ...normalizeConnections(connections),
      },
    }));
  },
  addDevice: (device, options) => {
    let operation: RackDocumentOperation | null = null;

    set((state) => {
      const revisionId = getNextRevisionId(state.document.revisionId, options);
      operation = {
        type: "device.added",
        rackId: state.document.rackId,
        revisionId,
        device,
      };

      return {
        document: {
          ...state.document,
          revisionId,
          deviceIds: state.document.deviceIds.includes(device.id)
            ? state.document.deviceIds
            : [...state.document.deviceIds, device.id],
          devicesById: {
            ...state.document.devicesById,
            [device.id]: device,
          },
        },
      };
    });
    if (operation) {
      emitRackDocumentOperation(operation);
    }
  },
  updateDeviceStartU: (deviceId, startU, options) => {
    let operation: RackDocumentOperation | null = null;

    set((state) => {
      const device = state.document.devicesById[deviceId];

      if (!device) {
        return state;
      }

      const revisionId = getNextRevisionId(state.document.revisionId, options);
      operation = {
        type: "device.moved",
        rackId: state.document.rackId,
        revisionId,
        deviceId,
        startU,
      };

      return {
        document: {
          ...state.document,
          revisionId,
          devicesById: {
            ...state.document.devicesById,
            [deviceId]: {
              ...device,
              startU,
            },
          },
        },
      };
    });
    if (operation) {
      emitRackDocumentOperation(operation);
    }
  },
  removeDevice: (deviceId, options) => {
    let operation: RackDocumentOperation | null = null;

    set((state) => {
      const revisionId = getNextRevisionId(state.document.revisionId, options);
      const { [deviceId]: _removed, ...devicesById } = state.document.devicesById;

      operation = {
        type: "device.removed",
        rackId: state.document.rackId,
        revisionId,
        deviceId,
      };

      return {
        document: {
          ...state.document,
          revisionId,
          deviceIds: state.document.deviceIds.filter((id) => id !== deviceId),
          devicesById,
        },
      };
    });
    if (operation) {
      emitRackDocumentOperation(operation);
    }
  },
  connectPorts: (from, to, id = crypto.randomUUID(), options) => {
    if (from.deviceId === to.deviceId && from.portId === to.portId) {
      return false;
    }

    let operation: RackDocumentOperation | null = null;
    let didCreate = false;

    set((state) => {
      const alreadyConnected = state.document.connectionIds.some((connectionId) =>
        isSameConnection(state.document.connectionsById[connectionId], from, to),
      );

      if (alreadyConnected) {
        return state;
      }

      didCreate = true;
      const revisionId = getNextRevisionId(state.document.revisionId, options);
      operation = {
        type: "connection.added",
        rackId: state.document.rackId,
        revisionId,
        connection: {
          id,
          from,
          to,
        },
      };

      return {
        document: {
          ...state.document,
          revisionId,
          connectionIds: [...state.document.connectionIds, id],
          connectionsById: {
            ...state.document.connectionsById,
            [id]: {
              id,
              from,
              to,
            },
          },
        },
      };
    });

    if (operation && didCreate) {
      emitRackDocumentOperation(operation);
    }

    return didCreate;
  },
  removeConnection: (connectionId, options) => {
    let operation: RackDocumentOperation | null = null;

    set((state) => {
      const revisionId = getNextRevisionId(state.document.revisionId, options);
      const { [connectionId]: _removed, ...connectionsById } = state.document.connectionsById;

      operation = {
        type: "connection.removed",
        rackId: state.document.rackId,
        revisionId,
        connectionId,
      };

      return {
        document: {
          ...state.document,
          revisionId,
          connectionIds: state.document.connectionIds.filter((id) => id !== connectionId),
          connectionsById,
        },
      };
    });
    if (operation) {
      emitRackDocumentOperation(operation);
    }
  },
  removeConnectionsForDevice: (deviceId) => {
    set((state) => {
      const connectionIds = state.document.connectionIds.filter((connectionId) => {
        const connection = state.document.connectionsById[connectionId];

        return (
          connection.from.deviceId !== deviceId && connection.to.deviceId !== deviceId
        );
      });

      const connectionsById = Object.fromEntries(
        connectionIds.map((connectionId) => [connectionId, state.document.connectionsById[connectionId]] as const),
      );

      return {
        document: {
          ...state.document,
          connectionIds,
          connectionsById,
        },
      };
    });
  },
}));
