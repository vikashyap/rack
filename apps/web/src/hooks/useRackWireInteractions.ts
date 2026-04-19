import type { MouseEvent, PointerEvent } from "react";

import { getRackPortTarget, getRackSvgPoint } from "../lib/rack-wire";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

export function useRackWireInteractions() {
  const activeConnection = useRackInteractionStore(
    (state) => state.interaction.activeConnection,
  );
  const startConnection = useRackInteractionStore((state) => state.startConnection);
  const completeConnection = useRackInteractionStore((state) => state.completeConnection);
  const cancelConnection = useRackInteractionStore((state) => state.cancelConnection);
  const setWirePoint = useRackInteractionStore((state) => state.setWirePoint);

  function handleCanvasClickCapture(event: MouseEvent<SVGSVGElement>) {
    const target = getRackPortTarget(event);

    if (target) {
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
    handleCanvasClickCapture,
    handleCanvasPointerMoveCapture,
    handleCanvasPointerLeaveCapture,
  };
}
