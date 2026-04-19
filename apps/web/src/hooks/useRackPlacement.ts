import { useCallback, useEffect, useState, type RefObject } from "react";

import type { DeviceTemplateConfig } from "@repo/config";

import {
  canPlaceRackDevice,
  getStartUFromClientY,
  type RackDevice,
  type RackDevicePreview,
} from "../lib/rack-placement";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

type UseRackPlacementArgs = {
  rackViewportRef: RefObject<HTMLElement | null>;
  templates: DeviceTemplateConfig[];
  initialDevices: RackDevice[];
};

const rackHeight = 42;

export function useRackPlacement({
  rackViewportRef,
  templates,
  initialDevices,
}: UseRackPlacementArgs) {
  const [devices, setDevices] = useState<RackDevice[]>(initialDevices);
  const activeDrag = useRackInteractionStore((state) => state.activeDrag);
  const mousePoint = useRackInteractionStore((state) => state.mousePoint);
  const lastDrop = useRackInteractionStore((state) => state.lastDrop);
  const view = useRackInteractionStore((state) => state.view);
  const preview = useRackInteractionStore((state) => state.preview);
  const setPreview = useRackInteractionStore((state) => state.setPreview);
  const clearDrop = useRackInteractionStore((state) => state.clearDrop);

  useEffect(() => {
    setDevices(initialDevices);
  }, [initialDevices]);

  useEffect(() => {
    if (!activeDrag || !mousePoint) {
      setPreview(null);
      return;
    }

    const source =
      activeDrag.kind === "template"
        ? templates.find((template) => template.id === activeDrag.id) ?? null
        : devices.find((device) => device.id === activeDrag.id) ?? null;

    if (!source) {
      setPreview(null);
      return;
    }

    const rackSvg = rackViewportRef.current?.querySelector("svg");

    if (!rackSvg) {
      setPreview(null);
      return;
    }

    const rackRect = rackSvg.getBoundingClientRect();
    const startU = getStartUFromClientY({
      clientY: mousePoint.y,
      rackTop: rackRect.top,
      rackRenderedHeight: rackRect.height,
      rackHeight,
    });

    const candidate: RackDevicePreview = {
      ...source,
      startU,
      view,
      isValid: canPlaceRackDevice(devices, { ...source, startU, view }, rackHeight),
    };

    setPreview(candidate);
  }, [activeDrag, devices, mousePoint, rackHeight, rackViewportRef, setPreview, templates, view]);

  useEffect(() => {
    if (!lastDrop) {
      return;
    }

    const source =
      lastDrop.item.kind === "template"
        ? templates.find((template) => template.id === lastDrop.item.id) ?? null
        : devices.find((device) => device.id === lastDrop.item.id) ?? null;

    if (!source) {
      clearDrop();
      return;
    }

    const rackSvg = rackViewportRef.current?.querySelector("svg");

    if (!rackSvg) {
      clearDrop();
      return;
    }

    const rackRect = rackSvg.getBoundingClientRect();
    const startU = getStartUFromClientY({
      clientY: lastDrop.point.y,
      rackTop: rackRect.top,
      rackRenderedHeight: rackRect.height,
      rackHeight,
    });

    const candidate = { ...source, startU, view };

    if (!canPlaceRackDevice(devices, candidate, rackHeight)) {
      clearDrop();
      return;
    }

    setDevices((current) =>
      lastDrop.item.kind === "template"
        ? [
            ...current,
            {
              ...source,
              id: crypto.randomUUID(),
              startU,
              view,
            },
          ]
        : current.map((device) =>
            device.id === source.id ? { ...device, startU } : device,
          ),
    );

    setPreview(null);
    clearDrop();
  }, [clearDrop, devices, lastDrop, rackHeight, rackViewportRef, setPreview, templates, view]);

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((current) => current.filter((device) => device.id !== deviceId));
    setPreview(null);
  }, [setPreview]);

  return {
    devices,
    preview,
    removeDevice,
  };
}
