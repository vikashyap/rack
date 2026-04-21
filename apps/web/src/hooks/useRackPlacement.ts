import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import type { DeviceTemplateConfig } from "@repo/config";

import type { RackDocumentResponse } from "../lib/api";
import {
  resolveRackDevices,
  type RackDevice,
} from "../lib/rack-placement";
import { useRackDocumentStore } from "../stores/rackDocumentStore";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

type UseRackPlacementArgs = {
  initialDocument: RackDocumentResponse | null;
  templates: DeviceTemplateConfig[];
};

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function useRackPlacement({
  initialDocument,
  templates,
}: UseRackPlacementArgs) {
  const {
    deviceIds,
    devicesById,
    removeConnectionsForDevice,
    removeDeviceFromDocument,
    seedDocument,
  } = useRackDocumentStore(
    useShallow((state) => ({
      deviceIds: state.document.deviceIds,
      devicesById: state.document.devicesById,
      removeConnectionsForDevice: state.removeConnectionsForDevice,
      removeDeviceFromDocument: state.removeDevice,
      seedDocument: state.seedDocument,
    })),
  );

  useEffect(() => {
    if (!initialDocument || deviceIds.length > 0) {
      return;
    }

    seedDocument(initialDocument);
  }, [deviceIds.length, initialDocument, seedDocument]);

  const devices = useMemo(
    () =>
      resolveRackDevices(
        deviceIds.map((deviceId) => devicesById[deviceId]).filter(isDefined),
        templates,
      ),
    [deviceIds, devicesById, templates],
  );

  function removeDevice(deviceId: string) {
    removeDeviceFromDocument(deviceId);
    removeConnectionsForDevice(deviceId);

    const interaction = useRackInteractionStore.getState();

    if (
      interaction.interaction.activeDrag?.kind === "rack-device" &&
      interaction.interaction.activeDrag.id === deviceId
    ) {
      interaction.clearDrag();
    }

    if (interaction.interaction.activeConnection?.deviceId === deviceId) {
      interaction.cancelConnection();
    }
  }

  return {
    devices,
    removeDevice,
  };
}
