import { memo, type PointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { Panel, RackFrame, ControlGroup } from "@repo/ui";

import type { RackCollaborationConnection, RackCollaborator } from "../lib/rack-collaboration";
import type { RackDevice } from "../lib/rack-placement";
import { RackDropZones } from "./RackDropZones";
import { RackPresencePointers } from "./RackPresencePointers";
import { RackWires } from "./RackWires";
import { RackDevices } from "./RackDevices";
import {
  RACK_MAX_ZOOM,
  RACK_MIN_ZOOM,
  useRackInteractionStore,
} from "../stores/rackInteractionStore";
import { useRackCollaborationPointer, useRackWireInteractions } from "../hooks";

interface RackFramePanelProps {
  collaborationConnection: RackCollaborationConnection | null;
  collaborators: RackCollaborator[];
  devices: RackDevice[];
  onRemoveDevice: (deviceId: string) => void;
}

const rackLayout = {
  rackHeight: 42,
  uHeight: 28,
  width: 420,
  railWidth: 40,
} as const;

const rackStyles = {
  outer: "mx-auto h-full min-h-0 w-full min-w-0 max-w-3xl",
  viewportOuter:
    "flex min-h-full items-start justify-center px-4 py-4 sm:px-6 sm:py-6",
} as const;

const RackHeaderControls = memo(function RackHeaderControls() {
  const { setView, theme, toggleTheme, view, zoom, zoomIn, zoomOut } =
    useRackInteractionStore(
      useShallow((state) => ({
        setView: state.setView,
        theme: state.interaction.theme,
        toggleTheme: state.toggleTheme,
        view: state.interaction.view,
        zoom: state.interaction.zoom,
        zoomIn: state.zoomIn,
        zoomOut: state.zoomOut,
      })),
    );

  const canZoomIn = zoom < RACK_MAX_ZOOM;
  const canZoomOut = zoom > RACK_MIN_ZOOM;

  return (
    <RackFrame.Header className="flex-wrap">
      <div className="flex flex-wrap items-center gap-2">
        <RackFrame.Actions view={view} onViewChange={setView} />
        <RackFrame.ZoomActions
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
        />
        <ControlGroup>
          <ControlGroup.Button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 px-0 py-0"
          >
            {theme === "dark" ? "☼" : "☾"}
          </ControlGroup.Button>
        </ControlGroup>
      </div>
    </RackFrame.Header>
  );
});

const RackViewport = memo(function RackViewport({
  collaborationConnection,
  collaborators,
  devices,
  onRemoveDevice,
}: {
  collaborationConnection: RackCollaborationConnection | null;
  collaborators: RackCollaborator[];
  devices: RackDevice[];
  onRemoveDevice: (deviceId: string) => void;
}) {
  const { view, zoom } = useRackInteractionStore(
    useShallow((state) => ({
      view: state.interaction.view,
      zoom: state.interaction.zoom,
    })),
  );

  const totalHeight = rackLayout.rackHeight * rackLayout.uHeight;
  const {
    handleCanvasClickCapture,
    handleCanvasPointerMoveCapture,
    handleCanvasPointerLeaveCapture,
  } = useRackWireInteractions();
  const {
    handleCollaborationPointerLeave,
    handleCollaborationPointerMove,
  } = useRackCollaborationPointer(collaborationConnection);

  function handlePointerMoveCapture(event: PointerEvent<SVGSVGElement>) {
    handleCanvasPointerMoveCapture(event);
    handleCollaborationPointerMove(event);
  }

  function handlePointerLeave() {
    handleCanvasPointerLeaveCapture();
    handleCollaborationPointerLeave();
  }

  return (
    <RackFrame.Viewport>
      <div className={rackStyles.viewportOuter}>
        <Panel
          tone="muted"
          className="w-full max-w-[48rem] p-4 transition-[max-width,width] duration-200 sm:p-6"
          style={{
            width: `${100 * zoom}%`,
          }}
        >
          <RackFrame.Canvas
            rackHeight={rackLayout.rackHeight}
            uHeight={rackLayout.uHeight}
            width={rackLayout.width}
            view={view}
            onClickCapture={handleCanvasClickCapture}
            onPointerMoveCapture={handlePointerMoveCapture}
            onPointerLeave={handlePointerLeave}
          >
            <RackFrame.Background width={rackLayout.width} totalHeight={totalHeight} />
            <RackFrame.Rails width={rackLayout.width} totalHeight={totalHeight} railWidth={rackLayout.railWidth} />
            <RackFrame.Markers
              rackHeight={rackLayout.rackHeight}
              uHeight={rackLayout.uHeight}
              width={rackLayout.width}
              railWidth={rackLayout.railWidth}
              mountHoleRadius={3}
            />
            <RackDropZones
              rackHeight={rackLayout.rackHeight}
              uHeight={rackLayout.uHeight}
              width={rackLayout.width}
              railWidth={rackLayout.railWidth}
            />
            <RackWires
              rackHeight={rackLayout.rackHeight}
              uHeight={rackLayout.uHeight}
              width={rackLayout.width}
              railWidth={rackLayout.railWidth}
              devices={devices}
            />
            <RackDevices
              rackHeight={rackLayout.rackHeight}
              uHeight={rackLayout.uHeight}
              width={rackLayout.width}
              railWidth={rackLayout.railWidth}
              devices={devices}
              onRemoveDevice={onRemoveDevice}
            />
            {collaborationConnection && (
              <RackPresencePointers
                currentUserId={collaborationConnection.session.id}
                rackHeight={rackLayout.rackHeight}
                railWidth={rackLayout.railWidth}
                uHeight={rackLayout.uHeight}
                users={collaborators}
                view={view}
                width={rackLayout.width}
              />
            )}
            <RackFrame.ViewBadge view={view} width={rackLayout.width} railWidth={rackLayout.railWidth} />
          </RackFrame.Canvas>
        </Panel>
      </div>
    </RackFrame.Viewport>
  );
});

export const RackFramePanel = memo(function RackFramePanel({
  collaborationConnection,
  collaborators,
  devices,
  onRemoveDevice,
}: RackFramePanelProps) {
  return (
    <RackFrame className={rackStyles.outer}>
      <RackHeaderControls />
      <RackViewport
        collaborationConnection={collaborationConnection}
        collaborators={collaborators}
        devices={devices}
        onRemoveDevice={onRemoveDevice}
      />
    </RackFrame>
  );
});
