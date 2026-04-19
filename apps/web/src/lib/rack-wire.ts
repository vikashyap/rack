import type { MouseEvent, PointerEvent } from "react";

import {
  resolveDevicePortAnchor,
  resolveDevicePortLayout,
} from "../../../../packages/device-templates/src/lib/device-port-layout";

import type { RackDevice } from "./rack-placement";

export type RackConnectionEndpoint = {
  deviceId: string;
  portId: string;
};

export type RackConnection = {
  id: string;
  from: RackConnectionEndpoint;
  to: RackConnectionEndpoint;
};

export type RackPoint = {
  x: number;
  y: number;
};

export function getRackSvgPoint(
  event: PointerEvent<SVGSVGElement>,
): RackPoint {
  const point = event.currentTarget.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const matrix = event.currentTarget.getScreenCTM()?.inverse();
  const svgPoint = matrix ? point.matrixTransform(matrix) : point;

  return {
    x: svgPoint.x,
    y: svgPoint.y,
  };
}

export function getRackPortTarget(
  event: MouseEvent<SVGSVGElement>,
): RackConnectionEndpoint | null {
  const target = event.target as Element | null;
  const portElement = target?.closest?.("[data-port-id]");
  const deviceElement = target?.closest?.("[data-device-id]");

  if (!portElement || !deviceElement) {
    return null;
  }

  const portId = portElement.getAttribute("data-port-id");
  const deviceId = deviceElement.getAttribute("data-device-id");

  if (!portId || !deviceId) {
    return null;
  }

  return {
    deviceId,
    portId,
  };
}

export function getRackDevicePortAnchor({
  device,
  portId,
  rackHeight,
  rackWidth,
  railWidth,
  uHeight,
  density = "rack",
}: {
  device: RackDevice;
  portId: string;
  rackHeight: number;
  rackWidth: number;
  railWidth: number;
  uHeight: number;
  density?: "compact" | "rack";
}) {
  const deviceWidth = rackWidth - railWidth * 2;
  const layout = resolveDevicePortLayout(device, deviceWidth, uHeight, density);
  const anchor = resolveDevicePortAnchor(layout, portId);

  if (!anchor) {
    return null;
  }

  return {
    x: railWidth + anchor.x + anchor.width / 2,
    y: (rackHeight - (device.startU + device.uHeight - 1)) * uHeight + anchor.y + anchor.height / 2,
    width: anchor.width,
    height: anchor.height,
  };
}

export function buildRackWirePath(from: RackPoint, to: RackPoint) {
  const controlX = Math.max(from.x, to.x) + Math.max(96, Math.abs(to.x - from.x) * 0.45);

  return [
    `M ${from.x} ${from.y}`,
    `C ${controlX} ${from.y}, ${controlX} ${to.y}, ${to.x} ${to.y}`,
  ].join(" ");
}
