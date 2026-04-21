import { Link } from "react-router-dom";

import { AppShell, ContentCard, PageHeader, ThemeToggle } from "@repo/ui";

import { useProjectsQuery } from "@hooks";
import { useThemeStore } from "@stores/themeStore";

function ProjectPreview({
  catalogCount,
  name,
  rackCount,
}: {
  catalogCount: number;
  name: string;
  rackCount: number;
}) {
  return (
    <div className="relative h-44 overflow-hidden bg-ui-surface-bg-strong">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-x-5 top-5 h-8 rounded-xl bg-ui-surface-bg shadow-sm ring-1 ring-inset ring-white/10" />
      <div className="absolute left-5 top-20 h-16 w-16 rounded-xl border border-ui-surface-border-soft bg-ui-surface-accent shadow-sm" />
      <div className="absolute right-5 top-20 h-24 w-32 rounded-2xl border border-ui-surface-border-soft bg-ui-surface-bg shadow-lg" />
      <div className="absolute inset-x-5 bottom-5 rounded-xl border border-ui-surface-border-soft bg-ui-surface-bg/90 px-3 py-2 backdrop-blur">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-ui-surface-subtitle">
          Rack Workspace
        </div>
        <div className="mt-1 text-sm font-semibold text-ui-text-strong">{name}</div>
        <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-ui-surface-subtitle">
          <span>{rackCount} racks</span>
          <span>{catalogCount} devices</span>
        </div>
      </div>
    </div>
  );
}

function NewProjectPreview() {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-ui-surface-bg-strong">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-ui-surface-border-soft bg-ui-control-item-active-bg text-4xl font-black text-ui-control-item-active-fg shadow-xl">
        +
      </div>
    </div>
  );
}
function DemoPreview() {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-ui-surface-bg-strong">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-ui-surface-border-soft bg-ui-control-item-active-bg text-sm font-black text-ui-control-item-active-fg shadow-xl">
        DEMO
      </div>
    </div>
  );
}

export function HomePage() {
  const projectsQuery = useProjectsQuery();
  const projects = projectsQuery.data ?? [];
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <AppShell>
      <div className="h-full overflow-auto px-6 py-6 custom-scrollbar">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <PageHeader>
            <PageHeader.Content>
              <PageHeader.Title>Projects</PageHeader.Title>
              <PageHeader.Description>
                Choose a rack workspace to continue editing.
              </PageHeader.Description>
            </PageHeader.Content>
            <PageHeader.Actions>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </PageHeader.Actions>
          </PageHeader>

          {projectsQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-[17rem] animate-pulse rounded-[1.35rem] border border-ui-surface-border bg-ui-surface-bg-strong"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                className="block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-4 focus-visible:ring-offset-ui-surface-bg"
              >
                <ContentCard
                  title="New Project"
                  subtitle="Create a new rack workspace"
                  preview={<NewProjectPreview />}
                  className="border-dashed hover:border-ui-status-online/40"
                >
                  <div className="text-xs font-medium text-ui-surface-subtitle">
                    UI placeholder for project creation.
                  </div>
                </ContentCard>
              </button>

              <Link
                to="/rack-editor-demo"
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-4 focus-visible:ring-offset-ui-surface-bg"
              >
                <ContentCard
                  title="Rack Editor Demo"
                  subtitle="Explore the rack editor capabilities"
                  preview={<DemoPreview />}
                />
              </Link>

              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/board/${project.id}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-status-online focus-visible:ring-offset-4 focus-visible:ring-offset-ui-surface-bg"
                >
                  <ContentCard
                    title={project.name}
                    subtitle={project.description}
                    preview={
                      <ProjectPreview
                        catalogCount={project.deviceCatalogCount}
                        name={project.name}
                        rackCount={project.rackCount}
                      />
                    }
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
