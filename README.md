# Pathfinder Web Rack View

This repository is a frontend architecture scaffold for an interactive rack view inside Pathfinder Web.

It is not a finished product. The goal of the scaffold is to make the system shape easy to understand:

- how project data enters the app
- how rack and device metadata are loaded
- how rack editing is modeled
- how collaboration is separated from document state
- where shared UI, config, and template code live

## What This Repo Is For

The take-home brief asked for:

1. an ADR with tradeoff reasoning
2. a scaffolded repo that reflects those decisions
3. workflow documentation describing AI usage

This repo is built to satisfy that goal, not to present a production-ready feature.

The strongest implementation area is the detailed rack editing demo. The board experience exists to show how the product could scale upward to project selection, board placement, and eventually multi-rack workflows.

## Product Mental Model

The product hierarchy is:

```txt
Project
-> Board
-> Rack
-> Device
-> Port
-> Connection
```

Each level has a different responsibility:

- `Project` scopes which racks and device metadata are available
- `Board` is a project-level overview where racks can be placed
- `Rack` is the detailed editing surface
- `Device` is a placed piece of equipment inside a rack
- `Port` is a connectable endpoint on a device
- `Connection` links one port to another

## Pages In This Scaffold

There are three important app surfaces:

- `HomePage`
  - project selection
- `BoardPage`
  - project-scoped overview and rack placement
- `rack-editor-demo`
  - the current detailed rack editing workflow

The detailed rack editor is where most of the real interaction work lives today.

## Repo Structure

```txt
apps/
  server/                mock API and websocket server
  web/                   React application

packages/
  config/                shared config types and design tokens
  ui/                    reusable primitives and compound UI components
  device-templates/      device SVG template registry and loaders
  rack-templates/        rack SVG template registry and loaders
```

### Why a monorepo

The scaffold uses a monorepo because the package boundaries are part of the architecture:

- `config` defines the shared vocabulary
- `ui` defines reusable primitives
- `device-templates` and `rack-templates` define template-specific rendering
- `apps/web` composes those pieces into product workflows

This makes the relationships between shared contracts and app code easier to inspect in one place.

The tradeoff is that workspace configuration is more involved and package boundaries need discipline. For this take-home, that tradeoff is worth it because the package structure itself is part of the explanation.

### Important app areas

```txt
apps/web/src/pages
  HomePage.tsx
  BoardPage.tsx
  AppFramePage.tsx

apps/web/src/features/rack
  detailed rack editor behavior

apps/web/src/features/board
  board placement behavior

apps/web/src/stores
  Zustand stores for document, interaction, viewport, presence, and theme state
```

## How Data Enters The UI

The app intentionally separates metadata loading from live rack document loading.

The intended backend shape is:

```txt
POST /api/projects
GET /api/projects/:projectId
GET /api/projects/:projectId/racks
GET /api/projects/:projectId/devices
GET /api/racks/:rackId/document
WS  /ws?projectId=...&rackId=...
```

The current scaffold uses simpler mock routes, but the frontend data flow is designed around the scoped version.

### Why this matters

The platform may have a very large master inventory.

For example:

- the platform may know about `500` rack metadata records
- the platform may know about `4000` device metadata records

When a project is created, the user selects a subset from that larger inventory.

Example:

- `30` rack metadata records
- `100` device metadata records

That subset becomes the project scope.

The live UI should not load every template implementation up front. It should:

1. load project metadata
2. load project-scoped rack metadata
3. load project-scoped device metadata
4. lazy-load SVG template implementations only when they are actually rendered

## Templates, Metadata, And Records

This repo distinguishes between three kinds of data:

### 1. Metadata

Metadata describes what can be used.

Example device metadata:

```json
{
  "id": "server-1u",
  "name": "Server (1U)",
  "category": "server",
  "templateKey": "server-default",
  "uHeight": 1,
  "ports": [
    { "id": "eth-1", "type": "ethernet" },
    { "id": "eth-2", "type": "ethernet" },
    { "id": "mgmt-1", "type": "console" }
  ]
}
```

### 2. Placed records

Placed records describe what is actually inside a rack.

Example rack device record:

```json
{
  "id": "rack-device-app-server-01",
  "templateKey": "server-default",
  "startU": 4,
  "view": "front"
}
```

### 3. Rendered templates

Rendered templates are SVG implementations loaded through registries.

The important rule is:

```txt
id identifies a record
templateKey identifies a template implementation
```

That is why the same placed record can be rendered correctly whether it came from:

- API load
- drag and drop
- websocket replay

SVG also helps the team workflow, not just the runtime rendering.

Because rack and device visuals are template-driven, designers can hand off SVG-oriented artwork and developers can clean it up, wrap it as a template component, and register it with a `templateKey` without changing the main editor shell.

That keeps small visual flows separated into reusable template areas:

- rack templates
- device templates
- shared rack frame primitives
- future port templates if the project evolves in that direction

This is one of the reasons the template packages matter. Visual template work can move forward without every template adjustment becoming an application-level refactor.

## Where Config Lives

`packages/config` defines stable contracts and rule-like metadata.

Examples:

- rack template keys
- device template keys
- port and category types
- shared TypeScript contracts
- design token names for styling

Config is not the same thing as live state.

Config answers:

- what kinds of things exist?
- what template keys are valid?
- what token names can primitives use?

Live application state answers:

- which project is selected?
- which rack is open?
- which devices are placed?
- which connections exist?
- which collaborators are online?

That split is intentional because config changes more slowly than live rack data.

The tradeoff is that a config package can become too broad if it is not kept disciplined. The intended rule is:

- config contains stable contracts and rule-like metadata
- config does not contain live app state or screen-specific behavior

## Next-Step Direction: Configurable SDK Boundaries

One natural evolution from this scaffold is to treat the board and rack features more like reusable React SDK modules.

That would mean:

- a `Board SDK`
  - receives board config
  - receives a collaboration connection
  - receives rack metadata to place on the board
- a `Rack SDK`
  - receives rack config
  - receives rack document data
  - receives rack-specific rules

The current scaffold is not fully packaged that way yet, but the config boundary is moving in that direction.

For example, a future board API could look like:

```tsx
<BoardSDK
  config={boardConfig}
  connection={webSocketConnection}
  racks={projectRacks}
/>
```

and each rack node could eventually be configured like:

```tsx
<RackSDK
  config={rackConfig}
  document={rackDocument}
  rules={rackRules}
/>
```

Example ideas for `boardConfig`:

- board dimensions
- allowed rack templates
- zoom limits
- placement rules
- collaboration options

Example ideas for `rackConfig`:

- rack height
- front/back views
- allowed device categories
- placement validation rules
- connection validation rules

The benefit of this direction is reusability:

- the board can be embedded in different products with different rules
- racks can be more configurable without rewriting the render system
- websocket or collaboration adapters can be swapped more easily

For now, those rules still mostly live in the app and config packages. The point is that the current structure gives a clear path toward more reusable SDK-style boundaries later.

## Theme System

Theming is handled through design tokens, not hard-coded component colors.

Current approach:

1. `packages/config/tailwind.css` defines token names
2. Tailwind maps those tokens into semantic utilities
3. primitives in `packages/ui` use semantic classes
4. `themeStore` toggles the active theme by switching the root theme class

So instead of writing raw classes like:

```txt
bg-slate-900
text-white
border-white/10
```

the primitives use semantic classes like:

```txt
bg-ui-surface-bg
text-ui-text-strong
border-ui-surface-border
```

This makes theme changes cheaper because the component API stays stable while the token values change underneath it.

## Compound UI Components

The UI package uses compound component patterns where composition is easier to read than many flat props.

Examples:

- `Panel`
- `ControlGroup`
- `RackFrame`

That lets the page read like composition:

```tsx
<RackFrame.Canvas>
  <RackFrame.Background />
  <RackFrame.Rails />
  <RackFrame.Markers />
</RackFrame.Canvas>
```

instead of pushing many structural props through several intermediary components.

This helps reduce prop drilling for presentational concerns and keeps the rack scene structure understandable.

## State Management

The app uses separate Zustand stores because the state has different lifetimes and update frequencies.

Current boundaries:

- `rackDocumentStore`
  - synced rack data
- `rackInteractionStore`
  - drag state, preview state, active connection, current view
- `boardViewportStore`
  - board zoom
- `rackPresenceStore`
  - collaborator presence and pointer state
- `themeStore`
  - active theme

### Why this helps

The editor is layered:

- rack frame layer
- device layer
- wire layer
- presence layer
- overlay and preview layer

Those layers should not all rerender for the same reason.

The intended rule is:

- document updates rerender document-driven layers
- presence updates rerender presence-driven layers
- viewport updates rerender viewport-driven surfaces

That boundary is one of the reasons Zustand is useful here. Components can subscribe to narrow slices instead of receiving one large app state object.

## Inventory Vs Live Rendering

The scaffold now uses a deliberate split:

```txt
Inventory = metadata list
Rack = real template rendering
```

That means:

- the inventory shows lightweight metadata
- the rack scene renders real SVG templates
- template implementations boot when the live rack actually needs them

This supports larger project-scoped catalogs better than rendering every template in the inventory list.

## Collaboration Model

The rack editor separates:

- ephemeral presence state
- committed document state

### Presence state

Examples:

- pointer position
- drag preview
- active collaborator list

This is high-frequency and should not mutate the rack document.

### Document state

Examples:

- device added
- device moved
- connection added
- connection removed

These are committed changes that can be replayed and persisted.

The current mental model is:

1. apply locally for responsiveness
2. emit a typed operation
3. validate and persist on the server
4. replay the confirmed change remotely

## How To Read The Code

Good starting points:

- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/pages/BoardPage.tsx`
- `apps/web/src/pages/AppFramePage.tsx`
- `apps/web/src/features/rack/RackScene.tsx`
- `apps/web/src/stores/rackDocumentStore.ts`
- `apps/web/src/stores/rackInteractionStore.ts`

Read in this order:

1. home and board pages to understand the product shape
2. `rackDocumentStore` to understand synced data
3. `rackInteractionStore` to understand editor interactions
4. rack scene and rack feature files to understand rendering and editing

## Local Setup

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm typecheck
pnpm build
```

## Important Submission Note

This scaffold is not being presented as production-ready code.

The rack editing demo is the strongest and most deliberate part of the implementation. That is the area where the reusable rendering structure and editing model are most mature.

The board layer serves a different purpose:

- it was built largely through AI-assisted prompting
- it was then simplified and corrected manually
- it exists to communicate product direction and loading strategy
- it is not yet the final optimized production architecture

So the right way to read this repo is:

- the rack editor demo shows the stronger reusable interaction pattern
- the board shows how that editor can fit into a broader product shell

## Related Docs

- `ADR.md`
  - architecture decisions and tradeoffs
- `APP_LIFECYCLE.md`
  - end-to-end routes, IDs, JSON flow, and store normalization
- `AI_LOG.md`
  - how AI tools were used during the assessment
