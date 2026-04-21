import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { RackFrame, ControlGroup, ThemeToggle } from "@repo/ui";

import type { RackCollaborationConnection, RackCollaborator } from "@lib/rack-collaboration";
import type { RackDevice } from "@lib/rack-placement";
import { RackScene } from "./RackScene";
import { useRackInteractionStore } from "@stores/rackInteractionStore";
import {
  BOARD_MAX_ZOOM,
  BOARD_MIN_ZOOM,
  useBoardViewportStore,
} from "@stores/boardViewportStore";
import { useThemeStore } from "@stores/themeStore";

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
  const { setView, view } =
    useRackInteractionStore(
      useShallow((state) => ({
        setView: state.setView,
        view: state.interaction.view,
      })),
    );
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const zoom = useBoardViewportStore((state) => state.zoom);
  const zoomIn = useBoardViewportStore((state) => state.zoomIn);
  const zoomOut = useBoardViewportStore((state) => state.zoomOut);

  const canZoomIn = zoom < BOARD_MAX_ZOOM;
  const canZoomOut = zoom > BOARD_MIN_ZOOM;

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
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
  const view = useRackInteractionStore((state) => state.interaction.view);
  const zoom = useBoardViewportStore((state) => state.zoom);

  return (
    <RackFrame.Viewport>
      <div className={rackStyles.viewportOuter}>
        <div
          className="w-full max-w-[48rem] rounded-2xl border border-ui-surface-border bg-ui-surface-bg-strong p-4 shadow-ui-surface ring-1 ring-inset ring-white/10 transition-[max-width,width] duration-200 sm:p-6"
          style={{
            width: `${100 * zoom}%`,
          }}
        >
          <RackScene
            collaborationConnection={collaborationConnection}
            collaborators={collaborators}
            devices={devices}
            interactive
            onRemoveDevice={onRemoveDevice}
            rackHeight={rackLayout.rackHeight}
            railWidth={rackLayout.railWidth}
            uHeight={rackLayout.uHeight}
            width={rackLayout.width}
          />
        </div>
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
