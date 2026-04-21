import { memo } from "react";

import type { RackView } from "@repo/ui";

import type { RackCollaborator } from "@lib/rack-collaboration";

interface RackPresencePointersProps {
  currentUserId: string;
  rackHeight: number;
  railWidth: number;
  uHeight: number;
  users: RackCollaborator[];
  view: RackView;
  width: number;
}

export const RackPresencePointers = memo(function RackPresencePointers({
  currentUserId,
  rackHeight,
  railWidth,
  uHeight,
  users,
  view,
  width,
}: RackPresencePointersProps) {
  const remoteUsers = users.filter(
    (user) =>
      user.id !== currentUserId &&
      ((user.pointer && user.pointer.view === view) ||
        (user.dragPreview && user.dragPreview.view === view)),
  );

  return (
    <g pointerEvents="none">
      {remoteUsers.map((user) => {
        const pointer = user.pointer;
        const dragPreview = user.dragPreview;

        if (!pointer && !dragPreview) {
          return null;
        }

        return (
          <g key={user.id}>
            {dragPreview && (
              <g
                transform={`translate(${railWidth}, ${
                  (rackHeight - (dragPreview.startU + dragPreview.heightU - 1)) *
                  uHeight
                })`}
              >
                <rect
                  width={width - railWidth * 2}
                  height={dragPreview.heightU * uHeight}
                  rx={4}
                  fill={user.color}
                  opacity={dragPreview.isValid ? 0.22 : 0.12}
                  stroke={dragPreview.isValid ? user.color : "#fb7185"}
                  strokeDasharray="5 4"
                  strokeWidth={2}
                />
                <text
                  x={12}
                  y={18}
                  fill={user.color}
                  className="text-[10px] font-black uppercase tracking-widest"
                >
                  {user.name} placing {dragPreview.name}
                </text>
              </g>
            )}

            {pointer && (
              <g transform={`translate(${pointer.x}, ${pointer.y})`}>
                <path
                  d="M0 0 0 18 5 13 9 22 14 19 10 11 18 11Z"
                  fill={user.color}
                  stroke="rgba(15, 23, 42, 0.9)"
                  strokeWidth={1.5}
                />
                <g transform="translate(14, 14)">
                  <rect
                    width={Math.max(56, user.name.length * 7)}
                    height={20}
                    rx={10}
                    fill={user.color}
                    opacity={0.95}
                  />
                  <text
                    x={10}
                    y={13.5}
                    className="fill-white text-[10px] font-bold"
                  >
                    {user.name}
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
});
