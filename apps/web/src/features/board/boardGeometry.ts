import type { DeviceTemplateConfig } from "@repo/config";

import type { BoardDragState, ProjectRackSummary } from "./boardTypes";

export function formatProjectName(projectId: string | undefined) {
  if (!projectId) {
    return "Shared board";
  }

  return projectId
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBoardRackMetrics(rack: ProjectRackSummary, zoom: number) {
  const width = (rack.heightU === 42 ? 380 : 340) * zoom;
  const unitHeight = 18 * zoom;
  const totalHeight = rack.heightU * unitHeight;

  return {
    totalHeight,
    unitHeight,
    width,
  };
}

export function getRackPreviewPosition(
  dragState: BoardDragState,
): { x: number; y: number } | null {
  if (!dragState.point) {
    return null;
  }

  return {
    x: dragState.point.x - dragState.offset.x,
    y: dragState.point.y - dragState.offset.y,
  };
}

export function getBoardDeviceMetrics(device: DeviceTemplateConfig, zoom: number) {
  const uHeight = 24 * zoom;
  const width = 300 * zoom;
  const height = device.uHeight * uHeight;

  return {
    height,
    uHeight,
    width,
  };
}
