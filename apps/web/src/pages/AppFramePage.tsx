import { useEffect } from "react";

import type { DeviceTemplateConfig } from "@repo/config";
import { AppShell } from "@repo/ui";

import { CollaborationPanel } from "../components/CollaborationPanel";
import { DeviceFrame } from "../components/DeviceFrame";
import { RackDragOverlay } from "../components/RackDragOverlay";
import { RackFramePanel } from "../components/RackFramePanel";
import {
  useDevicesQuery,
  useRackCollaborationConnection,
  useRackDocumentQuery,
  useRackPlacement,
} from "../hooks";
import { useRackInteractionStore } from "../stores/rackInteractionStore";

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

  const theme = useRackInteractionStore((state) => state.interaction.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
    }
  }, [theme]);

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
