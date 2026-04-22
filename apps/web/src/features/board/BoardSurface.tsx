import { useMemo, type PointerEvent as ReactPointerEvent } from "react";

import type { DeviceTemplateConfig } from "@repo/config";
import { DeviceTemplate } from "@repo/device-templates";
import { RackTemplate } from "@repo/rack-templates";

import {
  getRackDeviceY,
  resolveRackDevices,
  type RackDeviceRecord,
} from "@lib/rack-placement";
import {
  BOARD_VIEWBOX_HEIGHT,
  BOARD_VIEWBOX_WIDTH,
  type BoardDragState,
  type PlacedBoardRack,
  type ProjectRackSummary,
} from "./boardTypes";
import {
  getBoardDeviceMetrics,
  getBoardRackMetrics,
  getRackPreviewPosition,
} from "./boardGeometry";
import { useBoardViewportStore } from "@stores/boardViewportStore";

function BoardRackNode({
  active = false,
  devices,
  ghost = false,
  onActivate,
  rack,
  templates,
  x,
  y,
  zoom,
}: {
  active?: boolean;
  devices: RackDeviceRecord[];
  ghost?: boolean;
  onActivate?: (event: ReactPointerEvent<SVGRectElement>) => void;
  rack: ProjectRackSummary;
  templates: DeviceTemplateConfig[];
  x: number;
  y: number;
  zoom: number;
}) {
  const { totalHeight, unitHeight, width } = getBoardRackMetrics(rack, zoom);
  const rackDevices = resolveRackDevices(devices, templates);
  const rackTemplate = {
    id: rack.id,
    name: rack.name,
    templateKey: rack.templateKey,
    heightU: rack.heightU,
  } as const;
  const deviceX = 56;
  const deviceWidth = width - 112;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ pointerEvents: ghost ? "none" : "all" }}
      opacity={ghost ? 0.56 : 1}
    >
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
      <RackTemplate.Auto
        template={rackTemplate}
        width={width}
        unitHeight={unitHeight}
      />
      <g pointerEvents="none">
        {rackDevices.map((device) => (
          <g
            key={device.id}
            transform={`translate(${deviceX}, ${getRackDeviceY(
              device.startU,
              device.uHeight,
              rack.heightU,
              unitHeight,
            )})`}
          >
            <DeviceTemplate.Auto
              template={device}
              width={deviceWidth}
              uHeight={unitHeight}
              density="rack"
            />
          </g>
        ))}
      </g>
      <rect
        x={0}
        y={0}
        width={width}
        height={totalHeight}
        fill="transparent"
        onPointerDown={onActivate}
      />
      {active && !ghost ? (
        <rect
          x={-6 * zoom}
          y={-6 * zoom}
          width={width + 12 * zoom}
          height={totalHeight + 12 * zoom}
          rx={24 * zoom}
          fill="none"
          stroke="rgba(163,230,53,0.4)"
          strokeWidth={1.5 * zoom}
          pointerEvents="none"
        />
      ) : null}
    </g>
  );
}

export function BoardSurface({
  activePlacedRackId,
  dragState,
  onActivateRack,
  placedRacks,
  projectName,
  svgRef,
  templates,
}: {
  activePlacedRackId: string | null;
  dragState: BoardDragState | null;
  onActivateRack: (
    rackId: string,
    event: ReactPointerEvent<SVGRectElement>,
  ) => void;
  placedRacks: PlacedBoardRack[];
  projectName: string;
  svgRef: React.RefObject<SVGSVGElement | null>;
  templates: DeviceTemplateConfig[];
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
            devices={placedRack.devices}
            onActivate={(event) => onActivateRack(placedRack.id, event)}
            rack={placedRack.rack}
            templates={templates}
            x={placedRack.x}
            y={placedRack.y}
            zoom={zoom}
          />
        ),
      )}

      {dragState?.kind !== "device" && dragState && previewPosition ? (
        <BoardRackNode
          ghost
          devices={[]}
          rack={dragState.rack}
          templates={templates}
          x={previewPosition.x}
          y={previewPosition.y}
          zoom={zoom}
        />
      ) : null}

      {dragState?.kind === "device" && previewPosition ? (() => {
        const { height, uHeight, width } = getBoardDeviceMetrics(dragState.device, zoom);

        return (
          <g
            transform={`translate(${previewPosition.x}, ${previewPosition.y})`}
            pointerEvents="none"
            opacity={0.82}
          >
            <rect
              x={-10 * zoom}
              y={-10 * zoom}
              width={width + 20 * zoom}
              height={height + 20 * zoom}
              rx={18 * zoom}
              fill="rgba(15,23,42,0.32)"
              stroke="rgba(163,230,53,0.35)"
              strokeWidth={1.5 * zoom}
            />
            <DeviceTemplate.Auto
              template={dragState.device}
              width={width}
              uHeight={uHeight}
              density="rack"
            />
          </g>
        );
      })() : null}
    </svg>
  );
}
