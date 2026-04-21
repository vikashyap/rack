import { memo, type PointerEvent } from "react";

import { RackFrame, type RackFrameCanvasProps } from "@repo/ui";

import type { RackCollaborationConnection, RackCollaborator } from "@lib/rack-collaboration";
import type { RackDevice } from "@lib/rack-placement";
import { useRackCollaborationPointer, useRackWireInteractions } from "@hooks";
import { RackDevices } from "./RackDevices";
import { RackDropZones } from "./RackDropZones";
import { RackPresencePointers } from "./RackPresencePointers";
import { RackWires } from "./RackWires";
import { useRackInteractionStore } from "@stores/rackInteractionStore";

interface RackSceneProps
  extends Omit<RackFrameCanvasProps, "children" | "rackHeight" | "uHeight" | "view" | "width"> {
  collaborationConnection?: RackCollaborationConnection | null;
  collaborators?: RackCollaborator[];
  devices: RackDevice[];
  interactive?: boolean;
  onRemoveDevice: (deviceId: string) => void;
  rackHeight: number;
  railWidth: number;
  uHeight: number;
  width: number;
}

export const RackScene = memo(function RackScene({
  collaborationConnection = null,
  collaborators = [],
  devices,
  interactive = false,
  onRemoveDevice,
  rackHeight,
  railWidth,
  uHeight,
  width,
  ...canvasProps
}: RackSceneProps) {
  const view = useRackInteractionStore((state) => state.interaction.view);
  const {
    handleCanvasPointerDownCapture,
    handleCanvasPointerMoveCapture,
    handleCanvasPointerLeaveCapture,
  } = useRackWireInteractions();
  const {
    handleCollaborationPointerLeave,
    handleCollaborationPointerMove,
  } = useRackCollaborationPointer(collaborationConnection);

  function handlePointerMoveCapture(event: PointerEvent<SVGSVGElement>) {
    if (!interactive) {
      return;
    }

    handleCanvasPointerMoveCapture(event);
    handleCollaborationPointerMove(event);
  }

  function handlePointerLeave() {
    if (!interactive) {
      return;
    }

    handleCanvasPointerLeaveCapture();
    handleCollaborationPointerLeave();
  }

  return (
    <RackFrame.Canvas
      rackHeight={rackHeight}
      uHeight={uHeight}
      width={width}
      view={view}
      onPointerDownCapture={interactive ? handleCanvasPointerDownCapture : undefined}
      onPointerMoveCapture={interactive ? handlePointerMoveCapture : undefined}
      onPointerLeave={interactive ? handlePointerLeave : undefined}
      {...canvasProps}
    >
      <RackFrame.Background width={width} totalHeight={rackHeight * uHeight} />
      <RackFrame.Rails width={width} totalHeight={rackHeight * uHeight} railWidth={railWidth} />
      <RackFrame.Markers
        rackHeight={rackHeight}
        uHeight={uHeight}
        width={width}
        railWidth={railWidth}
        mountHoleRadius={3}
      />
      {interactive ? (
        <RackDropZones
          rackHeight={rackHeight}
          uHeight={uHeight}
          width={width}
          railWidth={railWidth}
        />
      ) : null}
      <RackWires
        rackHeight={rackHeight}
        uHeight={uHeight}
        width={width}
        railWidth={railWidth}
        devices={devices}
      />
      <RackDevices
        rackHeight={rackHeight}
        uHeight={uHeight}
        width={width}
        railWidth={railWidth}
        devices={devices}
        onRemoveDevice={onRemoveDevice}
      />
      {interactive && collaborationConnection ? (
        <RackPresencePointers
          currentUserId={collaborationConnection.session.id}
          rackHeight={rackHeight}
          railWidth={railWidth}
          uHeight={uHeight}
          users={collaborators}
          view={view}
          width={width}
        />
      ) : null}
      <RackFrame.ViewBadge view={view} width={width} railWidth={railWidth} />
    </RackFrame.Canvas>
  );
});
