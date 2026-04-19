import { memo } from "react";
import type { RefObject } from "react";

import { Panel, RackFrame, ControlGroup } from "@repo/ui";

import type { RackDevice } from "../lib/rack-placement";
import { RackDevices } from "./RackDevices";
import {
  RACK_MAX_ZOOM,
  RACK_MIN_ZOOM,
  useRackInteractionStore,
} from "../stores/rackInteractionStore";

interface RackFramePanelProps {
  devices: RackDevice[];
  onRemoveDevice: (deviceId: string) => void;
  rackViewportRef: RefObject<HTMLElement | null>;
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
  const view = useRackInteractionStore((state) => state.view);
  const zoom = useRackInteractionStore((state) => state.zoom);
  const theme = useRackInteractionStore((state) => state.theme);
  const setView = useRackInteractionStore((state) => state.setView);
  const zoomIn = useRackInteractionStore((state) => state.zoomIn);
  const zoomOut = useRackInteractionStore((state) => state.zoomOut);
  const toggleTheme = useRackInteractionStore((state) => state.toggleTheme);

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
  devices,
  onRemoveDevice,
  rackViewportRef,
}: {
  devices: RackDevice[];
  onRemoveDevice: (deviceId: string) => void;
  rackViewportRef: RefObject<HTMLElement | null>;
}) {
  const view = useRackInteractionStore((state) => state.view);
  const zoom = useRackInteractionStore((state) => state.zoom);

  const totalHeight = rackLayout.rackHeight * rackLayout.uHeight;

  return (
    <RackFrame.Viewport>
      <div className={rackStyles.viewportOuter}>
        <Panel
          ref={rackViewportRef}
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
            <RackDevices
              rackHeight={rackLayout.rackHeight}
              uHeight={rackLayout.uHeight}
              width={rackLayout.width}
              railWidth={rackLayout.railWidth}
              devices={devices}
              onRemoveDevice={onRemoveDevice}
            />
            <RackFrame.ViewBadge view={view} width={rackLayout.width} railWidth={rackLayout.railWidth} />
          </RackFrame.Canvas>
        </Panel>
      </div>
    </RackFrame.Viewport>
  );
});

export const RackFramePanel = memo(function RackFramePanel({
  devices,
  onRemoveDevice,
  rackViewportRef,
}: RackFramePanelProps) {
  return (
    <RackFrame className={rackStyles.outer}>
      <RackHeaderControls />
      <RackViewport
        devices={devices}
        onRemoveDevice={onRemoveDevice}
        rackViewportRef={rackViewportRef}
      />
    </RackFrame>
  );
});
