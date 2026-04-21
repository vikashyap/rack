import { create } from "zustand";

import type { DeviceTemplateConfig } from "@repo/config";
import type { RackView } from "@repo/ui";

import type { RackConnectionEndpoint } from "@lib/rack-wire";
import {
  canPlaceRackDevice,
  createRackDeviceRecord,
  getRackStartUFromPoint,
  type RackDevice,
  type RackDevicePreview,
} from "@lib/rack-placement";
import { useRackDocumentStore } from "./rackDocumentStore";

export type DragPoint = {
  x: number;
  y: number;
};

export type RackDragItem =
  | {
      kind: "template";
      id: string;
    }
  | {
      kind: "rack-device";
      id: string;
    };

type DragSources = {
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
};

export type RackInteractionState = {
  activeDrag: RackDragItem | null;
  mousePoint: DragPoint | null;
  wirePoint: DragPoint | null;
  preview: RackDevicePreview | null;
  activeConnection: RackConnectionEndpoint | null;
  view: RackView;
};

type RackInteractionStore = {
  interaction: RackInteractionState;
  startDrag: (item: RackDragItem, point: DragPoint) => void;
  moveDrag: (point: DragPoint, sources: DragSources) => void;
  endDrag: (point: DragPoint, sources: DragSources) => void;
  setWirePoint: (point: DragPoint | null) => void;
  clearDrag: () => void;
  startConnection: (endpoint: RackConnectionEndpoint) => void;
  completeConnection: (endpoint: RackConnectionEndpoint) => void;
  cancelConnection: () => void;
  setView: (view: RackView) => void;
};
const rackHeight = 42;

function resolveDragSource(
  item: RackDragItem | null,
  { templates, devices }: DragSources,
) {
  if (!item) {
    return null;
  }

  return item.kind === "template"
    ? templates.find((template) => template.id === item.id) ?? null
    : devices.find((device) => device.id === item.id) ?? null;
}

function buildDragPreview({
  item,
  point,
  sources,
  view,
}: {
  item: RackDragItem | null;
  point: DragPoint;
  sources: DragSources;
  view: RackView;
}) {
  const source = resolveDragSource(item, sources);
  const startU = getRackStartUFromPoint(point);

  if (!source || !startU) {
    return null;
  }

  const candidate = {
    ...source,
    startU,
    view,
  };

  return {
    ...candidate,
    isValid: canPlaceRackDevice(sources.devices, candidate, rackHeight),
  };
}

export const useRackInteractionStore = create<RackInteractionStore>((set, get) => ({
  interaction: {
    activeDrag: null,
    mousePoint: null,
    wirePoint: null,
    preview: null,
    activeConnection: null,
    view: "front",
  },
  startDrag: (item, point) => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        activeDrag: item,
        mousePoint: point,
      },
    }));
  },
  moveDrag: (point, sources) => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        mousePoint: point,
        preview: buildDragPreview({
          item: state.interaction.activeDrag,
          point,
          sources,
          view: state.interaction.view,
        }),
      },
    }));
  },
  endDrag: (point, sources) => {
    const { activeDrag, view } = get().interaction;
    const source = resolveDragSource(activeDrag, sources);
    const startU = getRackStartUFromPoint(point);

    if (activeDrag && source && startU) {
      const candidate = {
        ...source,
        startU,
        view,
      };

      if (canPlaceRackDevice(sources.devices, candidate, rackHeight)) {
        if (activeDrag.kind === "template") {
          useRackDocumentStore.getState().addDevice(
            createRackDeviceRecord(
              {
                templateKey: source.templateKey,
                startU,
                view,
              },
              crypto.randomUUID(),
            ),
          );
        } else {
          useRackDocumentStore.getState().updateDeviceStartU(source.id, startU);
        }
      }
    }

    get().clearDrag();
  },
  setWirePoint: (point) => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        wirePoint: point,
      },
    }));
  },
  clearDrag: () => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        activeDrag: null,
        mousePoint: null,
        preview: null,
      },
    }));
  },
  startConnection: (endpoint) => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        activeConnection: endpoint,
        wirePoint: null,
      },
    }));
  },
  completeConnection: (endpoint) => {
    const source = get().interaction.activeConnection;

    if (!source) {
      get().cancelConnection();
      return;
    }

    useRackDocumentStore.getState().connectPorts(source, endpoint);
    get().cancelConnection();
  },
  cancelConnection: () => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        activeConnection: null,
        wirePoint: null,
      },
    }));
  },
  setView: (view) => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        view,
      },
    }));
  },
}));
