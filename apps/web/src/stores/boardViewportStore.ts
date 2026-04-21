import { create } from "zustand";

type BoardViewportStore = {
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
};

const minZoom = 0.5;
const maxZoom = 2;
const zoomStep = 0.125;
const defaultZoom = 1;

export const BOARD_MIN_ZOOM = minZoom;
export const BOARD_MAX_ZOOM = maxZoom;
export const BOARD_DEFAULT_ZOOM = defaultZoom;

export const useBoardViewportStore = create<BoardViewportStore>((set) => ({
  zoom: defaultZoom,
  setZoom: (zoom) => {
    set({
      zoom: Math.min(maxZoom, Math.max(minZoom, zoom)),
    });
  },
  zoomIn: () => {
    set((state) => ({
      zoom: Math.min(maxZoom, state.zoom + zoomStep),
    }));
  },
  zoomOut: () => {
    set((state) => ({
      zoom: Math.max(minZoom, state.zoom - zoomStep),
    }));
  },
  resetZoom: () => {
    set({ zoom: defaultZoom });
  },
}));
