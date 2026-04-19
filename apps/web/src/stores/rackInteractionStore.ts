import { create } from "zustand";

import type { RackView } from "@repo/ui";

import type { RackDevicePreview } from "../lib/rack-placement";

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

type RackInteractionStore = {
  activeDrag: RackDragItem | null;
  mousePoint: DragPoint | null;
  preview: RackDevicePreview | null;
  lastDrop: { item: RackDragItem; point: DragPoint } | null;
  view: RackView;
  zoom: number;
  theme: "dark" | "light";
  startDrag: (item: RackDragItem, point: DragPoint) => void;
  moveDrag: (point: DragPoint) => void;
  endDrag: (point: DragPoint) => void;
  setPreview: (preview: RackDevicePreview | null) => void;
  clearDrop: () => void;
  clearDrag: () => void;
  setView: (view: RackView) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleTheme: () => void;
};

const minZoom = 0.75;
const maxZoom = 1.5;
const zoomStep = 0.125;

export const RACK_MIN_ZOOM = minZoom;
export const RACK_MAX_ZOOM = maxZoom;

export const useRackInteractionStore = create<RackInteractionStore>((set, get) => ({
  activeDrag: null,
  mousePoint: null,
  preview: null,
  lastDrop: null,
  view: "front",
  zoom: 1,
  theme: "dark",
  startDrag: (item, point) => {
    set({ activeDrag: item, mousePoint: point, lastDrop: null });
  },
  moveDrag: (point) => {
    set({ mousePoint: point });
  },
  endDrag: (point) => {
    const activeDrag = get().activeDrag;

    if (!activeDrag) {
      set({ mousePoint: null, preview: null });
      return;
    }

    set({
      lastDrop: { item: activeDrag, point },
      activeDrag: null,
      mousePoint: null,
    });
  },
  setPreview: (preview) => {
    set({ preview });
  },
  clearDrop: () => {
    set({ lastDrop: null });
  },
  clearDrag: () => {
    set({ activeDrag: null, mousePoint: null, preview: null, lastDrop: null });
  },
  setView: (view) => {
    set({ view });
  },
  setZoom: (zoom) => {
    set({ zoom: Math.min(maxZoom, Math.max(minZoom, zoom)) });
  },
  zoomIn: () => {
    set((state) => ({ zoom: Math.min(maxZoom, state.zoom + zoomStep) }));
  },
  zoomOut: () => {
    set((state) => ({ zoom: Math.max(minZoom, state.zoom - zoomStep) }));
  },
  toggleTheme: () => {
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" }));
  },
}));
