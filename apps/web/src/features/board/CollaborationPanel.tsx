import { memo } from "react";
import { Panel } from "@repo/ui";
import { cn } from "@lib/cn";
import type { RackCollaborationStatus, RackCollaborator } from "@lib/rack-collaboration";

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const WifiIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 13a10 10 0 0 1 14 0" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <line x1="12" x2="12.01" y1="20" y2="20" />
  </svg>
);

const CircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

interface UserProfileProps {
  name: string;
  initials: string;
  avatarColor: string;
  activeComponent?: string;
  isOnline?: boolean;
}

const UserProfile = memo(function UserProfile({
  name,
  initials,
  avatarColor,
  activeComponent,
  isOnline = true,
}: UserProfileProps) {
  return (
    <div className={cn(
      "group flex items-center gap-3 rounded-xl border border-ui-surface-border-soft bg-ui-surface-accent p-2.5 transition-all",
      "hover:bg-ui-control-item-hover-bg hover:shadow-xl"
    )}>
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-ui-surface-border"
        style={{ backgroundColor: avatarColor }}
      >
        <span className="text-white drop-shadow-md">{initials}</span>
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ui-surface-bg-strong bg-ui-status-online shadow-sm" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="truncate text-sm font-medium text-ui-text-strong transition-colors">
          {name}
        </span>
        {activeComponent && (
          <span className="truncate text-[10px] uppercase tracking-wider text-ui-status-editing font-semibold transition-colors">
            {activeComponent}
          </span>
        )}
      </div>
    </div>
  );
});

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface CollaborationPanelProps {
  currentUserId: string;
  status: RackCollaborationStatus;
  users: RackCollaborator[];
}

export function CollaborationPanel({
  currentUserId,
  status,
  users,
}: CollaborationPanelProps) {
  const isConnected = status === "connected";

  return (
    <Panel tone="muted" className="h-full min-h-0">
      <Panel.Header className="bg-ui-surface-accent/50">
        <div className="flex items-center gap-2.5 text-ui-text-strong">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ui-status-online/10 text-ui-status-online">
            <WifiIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Live Connection</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ui-status-online opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ui-status-online"></span>
              </span>
              <span className="text-[10px] font-medium text-ui-status-online opacity-80 uppercase tracking-widest">
                {isConnected ? "Active session" : status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ui-control-bg px-2.5 py-1 border border-ui-control-border">
          <UsersIcon className="h-3.5 w-3.5 text-ui-surface-subtitle" />
          <span className="text-[11px] font-bold text-ui-text-strong">{users.length}</span>
        </div>
      </Panel.Header>

      <Panel.Body className="space-y-4 overflow-y-auto custom-scrollbar">
        <div>
          <p className="text-[10px] font-bold text-ui-surface-subtitle uppercase tracking-[0.2em] mb-4">Collaborators online</p>
          <div className="grid gap-2.5">
            {users.map((user) => (
              <UserProfile
                key={user.id}
                name={user.name}
                initials={getInitials(user.name)}
                avatarColor={user.color}
                activeComponent={user.id === currentUserId ? "You" : user.pointer ? "Pointer active" : "Online"}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-ui-surface-bg-strong to-ui-surface-bg p-4 border border-ui-surface-border-soft shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-ui-text-strong">
            <CircleIcon className="h-3 w-3 text-ui-status-online fill-ui-status-online/20" />
            <span className="text-[11px] font-bold uppercase tracking-wider">WebSocket Status</span>
          </div>
          <p className="text-xs text-ui-surface-subtitle leading-relaxed">
            {isConnected
              ? "Presence websocket active. Remote pointers are visible inside the rack SVG."
              : "Waiting for websocket connection from the host app."}
          </p>
          <div className="mt-4 flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-ui-status-online/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full animate-pulse-slow",
                  isConnected ? "w-3/4 bg-ui-status-online" : "w-1/4 bg-ui-surface-subtitle",
                )}
              ></div>
            </div>
          </div>
        </div>
      </Panel.Body>

      <Panel.Footer className="mt-auto bg-ui-surface-accent/50">
        <button className={cn(
          "w-full rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.98]",
          "bg-ui-control-item-active-bg text-ui-control-item-active-fg",
          "hover:ring-2 hover:ring-ui-control-item-active-bg hover:ring-offset-2 hover:ring-offset-ui-surface-bg shadow-lg shadow-ui-control-item-active-bg/20"
        )}>
          Live Sync
        </button>
      </Panel.Footer>
    </Panel>
  );
}
