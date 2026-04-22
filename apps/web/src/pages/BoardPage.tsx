import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { AppShell, ControlGroup } from "@repo/ui";

import { useDevicesQuery, useProjectsQuery } from "@hooks";
import {
  BOARD_MAX_ZOOM,
  BOARD_MIN_ZOOM,
  useBoardViewportStore,
} from "@stores/boardViewportStore";
import { BoardSidebarPanel } from "@features/board/BoardSidebarPanel";
import { BoardSurface } from "@features/board/BoardSurface";
import { BoardTopBar } from "@features/board/BoardTopBar";
import { BoardToolbar } from "@features/board/BoardToolbar";
import {
  type BoardPanelKind,
} from "@features/board/boardTypes";
import { formatProjectName } from "@features/board/boardGeometry";
import { useBoardPlacement } from "@features/board/useBoardPlacement";

function BoardZoomControls() {
  const zoom = useBoardViewportStore((state) => state.zoom);
  const zoomIn = useBoardViewportStore((state) => state.zoomIn);
  const zoomOut = useBoardViewportStore((state) => state.zoomOut);
  const canZoomIn = zoom < BOARD_MAX_ZOOM;
  const canZoomOut = zoom > BOARD_MIN_ZOOM;

  return (
    <div className="pointer-events-none absolute bottom-6 right-6 z-20">
      <ControlGroup className="pointer-events-auto">
        <ControlGroup.Button onClick={zoomOut} disabled={!canZoomOut}>
          -
        </ControlGroup.Button>
        <ControlGroup.Value>{Math.round(zoom * 100)}%</ControlGroup.Value>
        <ControlGroup.Button onClick={zoomIn} disabled={!canZoomIn}>
          +
        </ControlGroup.Button>
      </ControlGroup>
    </div>
  );
}

export function BoardPage() {
  const { projectId } = useParams();
  const boardSvgRef = useRef<SVGSVGElement | null>(null);
  const boardZoom = useBoardViewportStore((state) => state.zoom);
  const projectsQuery = useProjectsQuery();
  const devicesQuery = useDevicesQuery();
  const projects = projectsQuery.data ?? [];
  const devices = devicesQuery.data ?? [];
  const [activePanel, setActivePanel] = useState<BoardPanelKind>("racks");
  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const projectName = selectedProject?.name ?? formatProjectName(projectId);
  const racks = selectedProject?.racks ?? [];
  const {
    activePlacedRackId,
    dragState,
    placedRacks,
    startDeviceDragFromSidebar,
    startPlacedRackDrag,
    startRackDragFromSidebar,
  } = useBoardPlacement({
    boardSvgRef,
    boardZoom,
    devices,
  });

  const handleRackDragStart = (
    ...args: Parameters<typeof startRackDragFromSidebar>
  ) => {
    startRackDragFromSidebar(...args);
    setActivePanel(null);
  };

  const handleDeviceDragStart = (
    ...args: Parameters<typeof startDeviceDragFromSidebar>
  ) => {
    startDeviceDragFromSidebar(...args);
    setActivePanel(null);
  };

  return (
    <AppShell className="bg-ui-surface-bg">
      <BoardTopBar />
      <BoardToolbar activePanel={activePanel} onSelectPanel={setActivePanel} />
      <BoardSidebarPanel
        activePanel={activePanel}
        devices={devices}
        onDeviceDragStart={handleDeviceDragStart}
        onClose={() => setActivePanel(null)}
        onRackDragStart={handleRackDragStart}
        racks={racks}
      />
      <BoardZoomControls />
      <div className="absolute inset-0">
        <BoardSurface
          activePlacedRackId={activePlacedRackId}
          dragState={dragState}
          onActivateRack={startPlacedRackDrag}
          placedRacks={placedRacks}
          projectName={projectName}
          svgRef={boardSvgRef}
          templates={devices}
        />
      </div>
    </AppShell>
  );
}
