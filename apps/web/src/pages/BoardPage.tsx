import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useParams } from "react-router-dom";

import {
  AppShell,
  ControlGroup,
  FloatingPanel,
  Panel,
  RackFrame,
  ThemeToggle,
} from "@repo/ui";

import { useDevicesQuery, useProjectsQuery } from "@hooks";
import { cn } from "@lib/cn";
import {
  BOARD_MAX_ZOOM,
  BOARD_MIN_ZOOM,
  useBoardViewportStore,
} from "@stores/boardViewportStore";
import { useThemeStore } from "@stores/themeStore";

type BoardPreset = {
  id: string;
  label: string;
  symbol: string;
};

const boardPresets: BoardPreset[] = [
  { id: "cursor", label: "Select", symbol: "↖" },
  { id: "racks", label: "Racks", symbol: "▥" },
  { id: "devices", label: "Devices", symbol: "◫" },
  { id: "connect", label: "Connect", symbol: "⌁" },
];

type BoardPanelKind = "racks" | "devices" | null;

type ProjectRackSummary = {
  id: string;
  name: string;
  templateKey: "rack-42u" | "rack-20u";
  heightU: number;
};

type PlacedBoardRack = {
  id: string;
  rack: ProjectRackSummary;
  x: number;
  y: number;
};

type BoardRackDragState =
  | {
    kind: "new";
    rack: ProjectRackSummary;
    point: { x: number; y: number } | null;
    offset: { x: number; y: number };
  }
  | {
    kind: "placed";
    rackId: string;
    rack: ProjectRackSummary;
    point: { x: number; y: number } | null;
    offset: { x: number; y: number };
  };

const BOARD_VIEWBOX_WIDTH = 3200;
const BOARD_VIEWBOX_HEIGHT = 1920;

function formatProjectName(projectId: string | undefined) {
  if (!projectId) {
    return "Shared board";
  }

  return projectId
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function buildDefaultProjectRacks(
  projectId: string | undefined,
  projectName: string,
): ProjectRackSummary[] {
  const scope = projectId ?? projectName.toLowerCase().replace(/\s+/g, "-");

  return [
    {
      id: `${scope}-rack-42`,
      name: "Primary Rack",
      templateKey: "rack-42u",
      heightU: 42,
    },
    {
      id: `${scope}-rack-20`,
      name: "Auxiliary Rack",
      templateKey: "rack-20u",
      heightU: 20,
    },
  ];
}

function getBoardRackMetrics(rack: ProjectRackSummary, zoom: number) {
  const width = (rack.heightU === 42 ? 380 : 340) * zoom;
  const unitHeight = 18 * zoom;
  const totalHeight = rack.heightU * unitHeight;

  return {
    totalHeight,
    unitHeight,
    width,
  };
}

function getRackPreviewPosition(
  dragState: BoardRackDragState,
): { x: number; y: number } | null {
  if (!dragState.point) {
    return null;
  }

  return {
    x: dragState.point.x - dragState.offset.x,
    y: dragState.point.y - dragState.offset.y,
  };
}

function BoardHeader() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-end px-6 py-5">
      <div className="pointer-events-auto flex items-center gap-2">
        <ControlGroup>
          <ControlGroup.Button active>Board</ControlGroup.Button>
          <ControlGroup.Button>Team</ControlGroup.Button>
        </ControlGroup>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </div>
  );
}

function BoardRackNode({
  active = false,
  ghost = false,
  onActivate,
  rack,
  x,
  y,
  zoom,
}: {
  active?: boolean;
  ghost?: boolean;
  onActivate?: (event: ReactPointerEvent<SVGRectElement>) => void;
  rack: ProjectRackSummary;
  x: number;
  y: number;
  zoom: number;
}) {
  const { totalHeight, unitHeight, width } = getBoardRackMetrics(rack, zoom);
  const railWidth = 40;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ pointerEvents: ghost ? "none" : "all" }}
      opacity={ghost ? 0.56 : 1}
    >
      <rect
        x={-14 * zoom}
        y={-58 * zoom}
        width={width + 28 * zoom}
        height={totalHeight + 72 * zoom}
        rx={22 * zoom}
        fill={ghost ? "rgba(15,23,42,0.34)" : "rgba(15,23,42,0.62)"}
        stroke={
          ghost
            ? "rgba(163,230,53,0.42)"
            : active
              ? "rgba(163,230,53,0.35)"
              : "rgba(148,163,184,0.22)"
        }
        strokeWidth={1.5 * zoom}
        onPointerDown={onActivate}
      />
      <text
        x={0}
        y={-28 * zoom}
        fill="var(--color-ui-text-strong)"
        fontSize={15 * zoom}
        fontWeight="700"
      >
        {rack.name}
      </text>
      <text
        x={0}
        y={-10 * zoom}
        fill="var(--color-ui-surface-subtitle)"
        fontSize={11 * zoom}
        fontWeight="600"
        letterSpacing={1.8 * zoom}
      >
        {rack.heightU}U RACK LAYOUT
      </text>
      <RackFrame.Background width={width} totalHeight={totalHeight} />
      <RackFrame.Rails width={width} totalHeight={totalHeight} railWidth={railWidth} />
      <RackFrame.Markers
        rackHeight={rack.heightU}
        uHeight={unitHeight}
        width={width}
        railWidth={railWidth}
        mountHoleRadius={3 * zoom}
      />
      <RackFrame.ViewBadge view="front" width={width} railWidth={railWidth} />
    </g>
  );
}

function BoardToolbar({
  activePanel,
  onSelectPanel,
}: {
  activePanel: BoardPanelKind;
  onSelectPanel: (panel: BoardPanelKind) => void;
}) {
  return (
    <div className="pointer-events-none absolute left-6 top-24 z-20 flex flex-col gap-3">
      <Panel className="pointer-events-auto overflow-visible">
        <Panel.Body className="flex flex-col gap-2 px-2 py-2">
          {boardPresets.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => {
                if (item.id === "racks" || item.id === "devices") {
                  onSelectPanel(activePanel === item.id ? null : item.id);
                }
              }}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface-bg",
                activePanel === item.id || (item.id === "cursor" && !activePanel)
                  ? "bg-ui-control-item-active-bg text-ui-control-item-active-fg shadow-sm"
                  : "text-ui-control-item-idle-fg hover:bg-ui-control-item-hover-bg hover:text-ui-text-strong",
              )}
            >
              {item.symbol}
            </button>
          ))}
        </Panel.Body>
      </Panel>
    </div>
  );
}

function BoardSidebarPanel({
  activePanel,
  devices,
  onClose,
  onRackDragStart,
  racks,
}: {
  activePanel: BoardPanelKind;
  devices: Array<{
    id: string;
    name: string;
    category: string;
    uHeight: number;
  }>;
  onClose: () => void;
  onRackDragStart: (
    rack: ProjectRackSummary,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  racks: Array<{
    id: string;
    name: string;
    templateKey: "rack-42u" | "rack-20u";
    heightU: number;
  }>;
}) {
  if (!activePanel) {
    return null;
  }

  const isRacks = activePanel === "racks";

  return (
    <div className="pointer-events-none absolute left-[5.75rem] top-24 z-20 w-[20rem]">
      <FloatingPanel
        open
        onClose={onClose}
        heading={isRacks ? "Project Racks" : "Project Devices"}
        subheading={
          isRacks
            ? "Drag racks onto the board."
            : "Devices belong inside racks, not on the board."
        }
      >
        <div className="max-h-[22rem] space-y-2 overflow-y-auto custom-scrollbar">
          {isRacks
            ? racks.map((rack) => (
              <button
                key={rack.id}
                type="button"
                onPointerDown={(event) => onRackDragStart(rack, event)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-ui-surface-border-soft bg-ui-surface-accent px-3 py-2.5 text-left transition hover:bg-ui-control-item-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface-bg"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ui-text-strong">
                    {rack.name}
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ui-surface-subtitle">
                    {rack.templateKey}
                  </div>
                </div>
                <div className="rounded-full border border-ui-surface-border-soft bg-ui-surface-bg px-2.5 py-1 text-[11px] font-semibold text-ui-text-strong">
                  {rack.heightU}U rack
                </div>
              </button>
            ))
            : devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ui-surface-border-soft bg-ui-surface-accent px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ui-text-strong">
                    {device.name}
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ui-surface-subtitle">
                    {device.category}
                  </div>
                </div>
                <div className="rounded-full border border-ui-surface-border-soft bg-ui-surface-bg px-2.5 py-1 text-[11px] font-semibold text-ui-text-strong">
                  {device.uHeight}U
                </div>
              </div>
            ))}
        </div>
      </FloatingPanel>
    </div>
  );
}

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

function BoardSurface({
  activePlacedRackId,
  dragState,
  onActivateRack,
  placedRacks,
  projectName,
  svgRef,
}: {
  activePlacedRackId: string | null;
  dragState: BoardRackDragState | null;
  onActivateRack: (
    rackId: string,
    event: ReactPointerEvent<SVGRectElement>,
  ) => void;
  placedRacks: PlacedBoardRack[];
  projectName: string;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const zoom = useBoardViewportStore((state) => state.zoom);
  const gridMinor = useMemo(() => Math.max(12, 24 * zoom), [zoom]);
  const gridMajor = useMemo(() => gridMinor * 5, [gridMinor]);
  const previewPosition = dragState ? getRackPreviewPosition(dragState) : null;

  return (
    <svg
      ref={svgRef}
      className="h-full w-full"
      viewBox={`0 0 ${BOARD_VIEWBOX_WIDTH} ${BOARD_VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      aria-label={`${projectName} board`}
    >
      <defs>
        <pattern
          id="board-grid-minor"
          width={gridMinor}
          height={gridMinor}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridMinor} 0 L 0 0 0 ${gridMinor}`}
            fill="none"
            stroke="rgba(148,163,184,0.10)"
            strokeWidth="1"
          />
        </pattern>
        <pattern
          id="board-grid-major"
          width={gridMajor}
          height={gridMajor}
          patternUnits="userSpaceOnUse"
        >
          <rect width={gridMajor} height={gridMajor} fill="url(#board-grid-minor)" />
          <path
            d={`M ${gridMajor} 0 L 0 0 0 ${gridMajor}`}
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>

      <rect width={BOARD_VIEWBOX_WIDTH} height={BOARD_VIEWBOX_HEIGHT} fill="var(--color-ui-surface-bg-strong)" />
      <rect width={BOARD_VIEWBOX_WIDTH} height={BOARD_VIEWBOX_HEIGHT} fill="url(#board-grid-major)" />

      {placedRacks.map((placedRack) =>
        dragState?.kind === "placed" && dragState.rackId === placedRack.id ? null : (
          <BoardRackNode
            key={placedRack.id}
            active={activePlacedRackId === placedRack.id}
            onActivate={(event) => onActivateRack(placedRack.id, event)}
            rack={placedRack.rack}
            x={placedRack.x}
            y={placedRack.y}
            zoom={zoom}
          />
        ),
      )}

      {dragState && previewPosition ? (
        <BoardRackNode
          ghost
          rack={dragState.rack}
          x={previewPosition.x}
          y={previewPosition.y}
          zoom={zoom}
        />
      ) : null}
    </svg>
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
  const [placedRacks, setPlacedRacks] = useState<PlacedBoardRack[]>([]);
  const [activePlacedRackId, setActivePlacedRackId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<BoardRackDragState | null>(null);
  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const projectName = selectedProject?.name ?? formatProjectName(projectId);
  const racks = selectedProject?.racks?.length
    ? selectedProject.racks
    : buildDefaultProjectRacks(projectId, projectName);

  const getBoardPoint = useCallback((clientX: number, clientY: number) => {
    const svg = boardSvgRef.current;

    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * BOARD_VIEWBOX_WIDTH,
      y: ((clientY - rect.top) / rect.height) * BOARD_VIEWBOX_HEIGHT,
    };
  }, []);

  const startRackDragFromSidebar = useCallback(
    (rack: ProjectRackSummary, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();

      const { width } = getBoardRackMetrics(rack, boardZoom);

      setDragState({
        kind: "new",
        rack,
        point: getBoardPoint(event.clientX, event.clientY),
        offset: {
          x: width / 2,
          y: 28 * boardZoom,
        },
      });
      setActivePanel(null);
    },
    [boardZoom, getBoardPoint],
  );

  const startPlacedRackDrag = useCallback(
    (rackId: string, event: ReactPointerEvent<SVGRectElement>) => {
      event.preventDefault();
      const placedRack = placedRacks.find((candidate) => candidate.id === rackId);
      const point = getBoardPoint(event.clientX, event.clientY);

      if (!placedRack || !point) {
        return;
      }

      setActivePlacedRackId(rackId);
      setDragState({
        kind: "placed",
        rackId,
        rack: placedRack.rack,
        point,
        offset: {
          x: point.x - placedRack.x,
          y: point.y - placedRack.y,
        },
      });
    },
    [getBoardPoint, placedRacks],
  );

  useEffect(() => {
    if (!dragState) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      setDragState((current) =>
        current
          ? {
            ...current,
            point: getBoardPoint(event.clientX, event.clientY),
          }
          : current,
      );
    }

    function handlePointerUp(event: PointerEvent) {
      const point = getBoardPoint(event.clientX, event.clientY);

      setDragState((current) => {
        if (!current) {
          return null;
        }

        const position = point
          ? {
            x: point.x - current.offset.x,
            y: point.y - current.offset.y,
          }
          : null;

        if (current.kind === "new" && position) {
          setPlacedRacks((existing) => {
            const placedRack = {
              id: `${current.rack.id}-${existing.length + 1}`,
              rack: current.rack,
              x: position.x,
              y: position.y,
            };

            setActivePlacedRackId(placedRack.id);
            return [...existing, placedRack];
          });
        }

        if (current.kind === "placed" && position) {
          setPlacedRacks((existing) =>
            existing.map((rack) =>
              rack.id === current.rackId
                ? {
                  ...rack,
                  x: position.x,
                  y: position.y,
                }
                : rack,
            ),
          );
        }

        return null;
      });
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, getBoardPoint]);

  return (
    <AppShell className="bg-ui-surface-bg">
      <BoardHeader />
      <BoardToolbar activePanel={activePanel} onSelectPanel={setActivePanel} />
      <BoardSidebarPanel
        activePanel={activePanel}
        devices={devices}
        onClose={() => setActivePanel(null)}
        onRackDragStart={startRackDragFromSidebar}
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
        />
      </div>
    </AppShell>
  );
}
