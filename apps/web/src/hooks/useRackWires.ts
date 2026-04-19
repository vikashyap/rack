import { useShallow } from "zustand/react/shallow";

import type { RackDevice } from "../lib/rack-placement";
import {
  buildRackWirePath,
  getRackDevicePortAnchor,
} from "../lib/rack-wire";
import { useRackDocumentStore } from "../stores/rackDocumentStore";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

type UseRackWiresArgs = {
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
  devices: RackDevice[];
};

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function useRackWires({
  rackHeight,
  uHeight,
  width,
  railWidth,
  devices,
}: UseRackWiresArgs) {
  const { activeConnection, view, wirePoint } = useRackInteractionStore(
    useShallow((state) => ({
      activeConnection: state.interaction.activeConnection,
      view: state.interaction.view,
      wirePoint: state.interaction.wirePoint,
    })),
  );
  const { connectionIds, connectionsById, removeConnection } = useRackDocumentStore(
    useShallow((state) => ({
      connectionIds: state.document.connectionIds,
      connectionsById: state.document.connectionsById,
      removeConnection: state.removeConnection,
    })),
  );

  const visibleDevices = devices.filter((device) => device.view === view);
  const deviceById = new Map(visibleDevices.map((device) => [device.id, device] as const));
  const connections = connectionIds
    .map((connectionId) => connectionsById[connectionId])
    .filter(isDefined);

  const committedPaths = connections.flatMap((connection) => {
    const fromDevice = deviceById.get(connection.from.deviceId);
    const toDevice = deviceById.get(connection.to.deviceId);

    if (!fromDevice || !toDevice) {
      return [];
    }

    const fromAnchor = getRackDevicePortAnchor({
      device: fromDevice,
      portId: connection.from.portId,
      rackHeight,
      rackWidth: width,
      railWidth,
      uHeight,
    });
    const toAnchor = getRackDevicePortAnchor({
      device: toDevice,
      portId: connection.to.portId,
      rackHeight,
      rackWidth: width,
      railWidth,
      uHeight,
    });

    if (!fromAnchor || !toAnchor) {
      return [];
    }

    return [
      {
        id: connection.id,
        path: buildRackWirePath(fromAnchor, toAnchor),
      },
    ];
  });

  let previewPath: string | null = null;

  if (activeConnection && wirePoint) {
    const sourceDevice = deviceById.get(activeConnection.deviceId);

    if (sourceDevice) {
      const sourceAnchor = getRackDevicePortAnchor({
        device: sourceDevice,
        portId: activeConnection.portId,
        rackHeight,
        rackWidth: width,
        railWidth,
        uHeight,
      });

      previewPath = sourceAnchor ? buildRackWirePath(sourceAnchor, wirePoint) : null;
    }
  }

  return {
    committedPaths,
    previewPath,
    removeConnection,
  };
}
