import { memo, useEffect, useMemo, useRef, useState } from "react";

import { Panel } from "@repo/ui";

import type { ProjectSummary } from "@lib/api";
import { cn } from "@lib/cn";

type BoardHeaderProps = {
  projects: ProjectSummary[];
};

export const BoardHeader = memo(function BoardHeader({
  projects,
}: BoardHeaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    projects[0]?.id ?? null,
  );
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const activeProject = useMemo(
    () =>
      projects.find((project) => project.id === activeProjectId) ??
      projects[0] ??
      null,
    [activeProjectId, projects],
  );

  useEffect(() => {
    if (!activeProjectId && projects[0]) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProjectId, projects]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProjectMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-40 flex items-start justify-between gap-4">
      <Panel
        tone="muted"
        className="pointer-events-auto w-auto min-w-[19rem] overflow-visible rounded-2xl"
      >
        <Panel.Header className="gap-4 border-none py-2.5">
          <div ref={containerRef} className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ui-control-item-active-bg text-sm font-black text-ui-control-item-active-fg shadow-sm">
              RB
            </div>
            <button
              type="button"
              onClick={() => setProjectMenuOpen((value) => !value)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition",
                "hover:bg-ui-control-item-hover-bg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface-bg",
              )}
              aria-expanded={projectMenuOpen}
              aria-label="Choose project"
            >
              <div>
                <Panel.Title className="text-sm">Rack Board</Panel.Title>
                <Panel.Description>
                  {activeProject ? activeProject.name : "No project selected"}
                </Panel.Description>
              </div>
              <span className="text-xs font-black text-ui-surface-subtitle">▾</span>
            </button>

            {projectMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+0.75rem)] z-20 w-[15rem] rounded-2xl border border-ui-surface-border bg-ui-surface-bg p-2 shadow-2xl ring-1 ring-inset ring-white/10 backdrop-blur-xl">
                <div className="px-2 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ui-surface-subtitle">
                    Projects
                  </div>
                </div>
                <div className="space-y-1">
                  {projects.map((project) => {
                    const active = project.id === activeProject?.id;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setActiveProjectId(project.id);
                          setProjectMenuOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition",
                          active
                            ? "bg-ui-control-item-active-bg text-ui-control-item-active-fg shadow-sm"
                            : "text-ui-text-strong hover:bg-ui-control-item-hover-bg",
                        )}
                      >
                        <span className="text-sm font-semibold">{project.name}</span>
                        {active ? (
                          <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                            Active
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </Panel.Header>
      </Panel>

      <Panel tone="muted" className="pointer-events-auto overflow-visible rounded-2xl">
        <Panel.Header className="gap-3 border-none py-2.5">
          <div className="text-right">
            <Panel.Title className="text-sm">Shared Workspace</Panel.Title>
            <Panel.Description>Board layer above the rack editor</Panel.Description>
          </div>
        </Panel.Header>
      </Panel>
    </div>
  );
});
