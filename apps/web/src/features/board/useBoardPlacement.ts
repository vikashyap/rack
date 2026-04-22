import {
  useCallback,
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import type { DeviceTemplateConfig } from "@repo/config";

import {
  canPlaceRackDevice,
  createRackDeviceRecord,
  resolveRackDevices,
} from "@lib/rack-placement";

import {
  BOARD_VIEWBOX_HEIGHT,
  BOARD_VIEWBOX_WIDTH,
  type BoardDragState,
  type PlacedBoardRack,
  type ProjectRackSummary,
} from "./boardTypes";
import { getBoardDeviceMetrics, getBoardRackMetrics } from "./boardGeometry";

export function useBoardPlacement({
  boardSvgRef,
  boardZoom,
  devices,
}: {
  boardSvgRef: RefObject<SVGSVGElement | null>;
  boardZoom: number;
  devices: DeviceTemplateConfig[];
}) {
  const [placedRacks, setPlacedRacks] = useState<PlacedBoardRack[]>([]);
  const [activePlacedRackId, setActivePlacedRackId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<BoardDragState | null>(null);

  const getBoardPoint = useCallback(
    (clientX: number, clientY: number) => {
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
    },
    [boardSvgRef],
  );

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
        originClient: {
          x: event.clientX,
          y: event.clientY,
        },
        didMove: false,
      });
    },
    [boardZoom, getBoardPoint],
  );

  const startDeviceDragFromSidebar = useCallback(
    (device: DeviceTemplateConfig, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();

      const { height, width } = getBoardDeviceMetrics(device, boardZoom);

      setDragState({
        kind: "device",
        device,
        point: getBoardPoint(event.clientX, event.clientY),
        offset: {
          x: width / 2,
          y: height / 2,
        },
        originClient: {
          x: event.clientX,
          y: event.clientY,
        },
        didMove: false,
      });
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
          ? current.kind === "new" || current.kind === "device"
            ? {
                ...current,
                point: getBoardPoint(event.clientX, event.clientY),
                didMove:
                  current.didMove ||
                  Math.abs(event.clientX - current.originClient.x) > 6 ||
                  Math.abs(event.clientY - current.originClient.y) > 6,
              }
            : {
                ...current,
                point: getBoardPoint(event.clientX, event.clientY),
              }
          : current,
      );
    }

    function handlePointerUp(event: PointerEvent) {
      const currentDrag = dragState;

      if (!currentDrag) {
        setDragState(null);
        return;
      }

      const point = getBoardPoint(event.clientX, event.clientY);
      const position = point
        ? {
            x: point.x - currentDrag.offset.x,
            y: point.y - currentDrag.offset.y,
          }
        : null;

      if (currentDrag.kind === "new" && currentDrag.didMove && position) {
        setPlacedRacks((existing) => {
          const placedRack = {
            id: `${currentDrag.rack.id}-${existing.length + 1}`,
            rack: currentDrag.rack,
            x: position.x,
            y: position.y,
            devices: [],
          };

          setActivePlacedRackId(placedRack.id);
          return [...existing, placedRack];
        });
      }

      if (currentDrag.kind === "placed" && position) {
        setPlacedRacks((existing) =>
          existing.map((rack) =>
            rack.id === currentDrag.rackId
              ? {
                  ...rack,
                  x: position.x,
                  y: position.y,
                }
              : rack,
          ),
        );
      }

      if (currentDrag.kind === "device" && currentDrag.didMove && point) {
        setPlacedRacks((existing) => {
          const targetRack = existing.find((rack) => {
            const { totalHeight, width } = getBoardRackMetrics(rack.rack, boardZoom);

            return (
              point.x >= rack.x &&
              point.x <= rack.x + width &&
              point.y >= rack.y &&
              point.y <= rack.y + totalHeight
            );
          });

          if (!targetRack) {
            return existing;
          }

          const { unitHeight } = getBoardRackMetrics(targetRack.rack, boardZoom);
          const localY = point.y - targetRack.y;
          const rowFromTop = Math.max(0, Math.floor(localY / unitHeight));
          const startU = Math.max(
            1,
            Math.min(
              targetRack.rack.heightU - currentDrag.device.uHeight + 1,
              targetRack.rack.heightU - rowFromTop - currentDrag.device.uHeight + 1,
            ),
          );
          const resolvedDevices = resolveRackDevices(targetRack.devices, devices);
          const candidate = {
            id: "__preview__",
            startU,
            uHeight: currentDrag.device.uHeight,
            view: "front" as const,
          };

          if (!canPlaceRackDevice(resolvedDevices, candidate, targetRack.rack.heightU)) {
            return existing;
          }

          const deviceRecord = createRackDeviceRecord({
            templateKey: currentDrag.device.templateKey,
            startU,
            view: "front",
          });

          setActivePlacedRackId(targetRack.id);

          return existing.map((rack) =>
            rack.id === targetRack.id
              ? {
                  ...rack,
                  devices: [...rack.devices, deviceRecord],
                }
              : rack,
          );
        });
      }

      setDragState(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [boardZoom, devices, dragState, getBoardPoint]);

  return {
    activePlacedRackId,
    dragState,
    placedRacks,
    startDeviceDragFromSidebar,
    startPlacedRackDrag,
    startRackDragFromSidebar,
  };
}
