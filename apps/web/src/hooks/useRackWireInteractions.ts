import type { PointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { getRackPortTarget, getRackSvgPoint } from "../lib/rack-wire";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

export function useRackWireInteractions() {
  const {
    activeConnection,
    cancelConnection,
    completeConnection,
    setWirePoint,
    startConnection,
  } = useRackInteractionStore(
    useShallow((state) => ({
      activeConnection: state.interaction.activeConnection,
      cancelConnection: state.cancelConnection,
      completeConnection: state.completeConnection,
      setWirePoint: state.setWirePoint,
      startConnection: state.startConnection,
    })),
  );

  function handleCanvasPointerDownCapture(event: PointerEvent<SVGSVGElement>) {
    const target = getRackPortTarget(event);

    if (target) {
      event.stopPropagation();

      if (!activeConnection) {
        startConnection(target);
      } else {
        completeConnection(target);
      }

      return;
    }

    if (activeConnection) {
      cancelConnection();
    }
  }

  function handleCanvasPointerMoveCapture(event: PointerEvent<SVGSVGElement>) {
    if (!activeConnection) {
      return;
    }

    setWirePoint(getRackSvgPoint(event));
  }

  function handleCanvasPointerLeaveCapture() {
    setWirePoint(null);
  }

  return {
    handleCanvasPointerDownCapture,
    handleCanvasPointerMoveCapture,
    handleCanvasPointerLeaveCapture,
  };
}
