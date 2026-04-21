import { create } from "zustand";

import type { RackDocumentOperation } from "../lib/rack-collaboration";
import { sendRackDocumentOperation as emitRackDocumentOperation } from "../lib/rack-document-operations";
import type { RackConnection, RackConnectionEndpoint } from "../lib/rack-wire";
import type { RackDeviceRecord } from "../lib/rack-placement";

export type RackDocumentState = {
  deviceIds: string[];
  devicesById: Record<string, RackDeviceRecord>;
  connectionIds: string[];
  connectionsById: Record<string, RackConnection>;
};

type RackDocumentStore = {
  document: RackDocumentState;
  seedDocument: (devices: RackDeviceRecord[], connections?: RackConnection[]) => void;
  addDevice: (device: RackDeviceRecord) => void;
  updateDeviceStartU: (deviceId: string, startU: number) => void;
  removeDevice: (deviceId: string) => void;
  connectPorts: (
    from: RackConnectionEndpoint,
    to: RackConnectionEndpoint,
    id?: string,
  ) => boolean;
  removeConnection: (connectionId: string) => void;
  removeConnectionsForDevice: (deviceId: string) => void;
};

const emptyDocument = (): RackDocumentState => ({
  deviceIds: [],
  devicesById: {},
  connectionIds: [],
  connectionsById: {},
});

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
  seedDocument: (devices, connections = []) => {
    set((state) => ({
      document: {
        ...state.document,
        ...normalizeDevices(devices),
        ...normalizeConnections(connections),
      },
    }));
  },
  addDevice: (device) => {
    set((state) => ({
      document: {
        ...state.document,
        deviceIds: state.document.deviceIds.includes(device.id)
          ? state.document.deviceIds
          : [...state.document.deviceIds, device.id],
        devicesById: {
          ...state.document.devicesById,
          [device.id]: device,
        },
      },
    }));
    emitRackDocumentOperation({
      type: "device.added",
      device,
    });
  },
  updateDeviceStartU: (deviceId, startU) => {
    set((state) => {
      const device = state.document.devicesById[deviceId];

      if (!device) {
        return state;
      }

      return {
        document: {
          ...state.document,
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
    emitRackDocumentOperation({
      type: "device.moved",
      deviceId,
      startU,
    });
  },
  removeDevice: (deviceId) => {
    set((state) => {
      const { [deviceId]: _removed, ...devicesById } = state.document.devicesById;

      return {
        document: {
          ...state.document,
          deviceIds: state.document.deviceIds.filter((id) => id !== deviceId),
          devicesById,
        },
      };
    });
    emitRackDocumentOperation({
      type: "device.removed",
      deviceId,
    });
  },
  connectPorts: (from, to, id = crypto.randomUUID()) => {
    if (from.deviceId === to.deviceId && from.portId === to.portId) {
      return false;
    }

    let didCreate = false;

    set((state) => {
      const alreadyConnected = state.document.connectionIds.some((connectionId) =>
        isSameConnection(state.document.connectionsById[connectionId], from, to),
      );

      if (alreadyConnected) {
        return state;
      }

      didCreate = true;

      return {
        document: {
          ...state.document,
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

    if (didCreate) {
      emitRackDocumentOperation({
        type: "connection.added",
        connection: {
          id,
          from,
          to,
        },
      });
    }

    return didCreate;
  },
  removeConnection: (connectionId) => {
    set((state) => {
      const { [connectionId]: _removed, ...connectionsById } = state.document.connectionsById;

      return {
        document: {
          ...state.document,
          connectionIds: state.document.connectionIds.filter((id) => id !== connectionId),
          connectionsById,
        },
      };
    });
    emitRackDocumentOperation({
      type: "connection.removed",
      connectionId,
    });
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
