import { memo } from "react";

import { useRackWires } from "../hooks";
import type { RackDevice } from "../lib/rack-placement";

interface RackWiresProps {
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
  devices: RackDevice[];
}

export const RackWires = memo(function RackWires({
  rackHeight,
  uHeight,
  width,
  railWidth,
  devices,
}: RackWiresProps) {
  const { committedPaths, previewPath, removeConnection } = useRackWires({
    rackHeight,
    uHeight,
    width,
    railWidth,
    devices,
  });

  return (
    <g>
      {committedPaths.map((wire) => (
        <g
          key={wire.id}
          className="cursor-pointer"
          pointerEvents="stroke"
          onDoubleClick={(event) => {
            event.stopPropagation();
            removeConnection(wire.id);
          }}
        >
          <path
            d={wire.path}
            className="fill-none stroke-ui-wire-glow opacity-30"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={wire.path}
            className="fill-none stroke-ui-wire-stroke"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      {previewPath ? (
        <g pointerEvents="none">
          <path
            d={previewPath}
            className="fill-none stroke-ui-wire-glow opacity-40"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 8"
          />
          <path
            d={previewPath}
            className="fill-none stroke-ui-wire-stroke"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 8"
          />
        </g>
      ) : null}
    </g>
  );
});
