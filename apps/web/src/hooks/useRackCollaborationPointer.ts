import { useRef, type PointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { getRackSvgPoint } from "@lib/rack-wire";
import type { RackCollaborationConnection } from "@lib/rack-collaboration";
import { useRackInteractionStore } from "@stores/rackInteractionStore";

const pointerSendIntervalMs = 40;

export function useRackCollaborationPointer(
  connection: RackCollaborationConnection | null,
) {
  const lastSentAt = useRef(0);
  const { preview, view } = useRackInteractionStore(
    useShallow((state) => ({
      preview: state.interaction.preview,
      view: state.interaction.view,
    })),
  );

  function sendPresence(point: { x: number; y: number } | null) {
    if (!connection) {
      return;
    }

    connection.sendPresence({
      pointer: point ? { ...point, view } : null,
      dragPreview: preview
        ? {
            heightU: preview.uHeight,
            isValid: preview.isValid,
            name: preview.name,
            startU: preview.startU,
            view: preview.view,
          }
        : null,
    });
  }

  function handleCollaborationPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!connection) {
      return;
    }

    const now = Date.now();

    if (now - lastSentAt.current < pointerSendIntervalMs) {
      return;
    }

    lastSentAt.current = now;
    sendPresence(getRackSvgPoint(event));
  }

  function handleCollaborationPointerLeave() {
    sendPresence(null);
  }

  return {
    handleCollaborationPointerLeave,
    handleCollaborationPointerMove,
  };
}
