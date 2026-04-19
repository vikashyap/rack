import { memo } from "react";

interface RackDropZonesProps {
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
}

export const RackDropZones = memo(function RackDropZones({
  rackHeight,
  uHeight,
  width,
  railWidth,
}: RackDropZonesProps) {
  return (
    <g aria-hidden="true" pointerEvents="all">
      {Array.from({ length: rackHeight }, (_, index) => index + 1).map((startU) => (
        <rect
          key={startU}
          data-rack-u={startU}
          x={railWidth}
          y={(rackHeight - startU) * uHeight}
          width={width - railWidth * 2}
          height={uHeight}
          fill="transparent"
        />
      ))}
    </g>
  );
});
