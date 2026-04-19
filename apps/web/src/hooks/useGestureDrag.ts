import { useRef } from "react";
import { useDrag } from "@use-gesture/react";

export type GesturePoint = {
  x: number;
  y: number;
};

export type GestureDragHandlers<TPayload> = {
  onDragStart?: (payload: TPayload, point: GesturePoint) => void;
  onDragMove?: (payload: TPayload, point: GesturePoint) => void;
  onDragEnd?: (payload: TPayload, point: GesturePoint) => void;
};

export function useGestureDrag<TPayload>(
  payload: TPayload,
  handlers: GestureDragHandlers<TPayload>,
) {
  const startedRef = useRef(false);

  return useDrag(
    ({ first, last, active, xy: [x, y], event }) => {
      const point = { x, y };

      if (first && !startedRef.current) {
        startedRef.current = true;
        handlers.onDragStart?.(payload, point);
      }

      if (active) {
        handlers.onDragMove?.(payload, point);
      }

      if (last) {
        handlers.onDragEnd?.(payload, point);
        startedRef.current = false;
      }

      if (event.cancelable) {
        event.preventDefault();
      }
    },
    {
      filterTaps: true,
      threshold: 1,
    },
  );
}
