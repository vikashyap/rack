import type { DeviceTemplateConfig } from "@repo/config";
import { AppShell } from "@repo/ui";

import { CollaborationPanel } from "@features/board/CollaborationPanel";
import { DeviceFrame } from "@features/rack/DeviceFrame";
import { RackDragOverlay } from "@features/rack/RackDragOverlay";
import { RackFramePanel } from "@features/rack/RackFramePanel";
import {
  useDevicesQuery,
  useRackCollaborationConnection,
  useRackDocumentQuery,
  useRackPlacement,
} from "@hooks";

const EMPTY_DEVICE_TEMPLATES: DeviceTemplateConfig[] = [];

export function AppFramePage() {
  const devicesQuery = useDevicesQuery();
  const rackDocumentQuery = useRackDocumentQuery();
  const collaboration = useRackCollaborationConnection();
  const templates = devicesQuery.data ?? EMPTY_DEVICE_TEMPLATES;

  const {
    devices,
    removeDevice,
  } = useRackPlacement({
    initialDocument: rackDocumentQuery.data ?? null,
    templates,
  });

  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-cols-[minmax(220px,1fr)_minmax(360px,2fr)_minmax(220px,1fr)] gap-4 px-4 py-4">
        <DeviceFrame
          templates={templates}
          devices={devices}
        />

        <RackFramePanel
          collaborationConnection={collaboration.connection}
          collaborators={collaboration.users}
          devices={devices}
          onRemoveDevice={removeDevice}
        />
        <CollaborationPanel
          currentUserId={collaboration.connection.session.id}
          status={collaboration.status}
          users={collaboration.users}
        />
      </div>

      <RackDragOverlay
        templates={templates}
        devices={devices}
      />
    </AppShell>
  );
}
