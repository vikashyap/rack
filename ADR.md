# Architecture Decision Record: Pathfinder Web Rack View

## Status

Accepted for the take-home scaffold.

## Scope

This ADR is written for the assessment brief, not for a finished production feature.

The goal is to explain:

- how the rack view should be rendered
- how the UI should be decomposed
- how collaboration should work
- how state should be structured
- how the frontend should integrate with project- and rack-scoped APIs

The scaffold intentionally demonstrates architecture and tradeoff thinking rather than a fully finished application.

## Required Topic 1: Rendering

### Decision

Use SVG as the primary rendering layer for racks, devices, ports, and wire connections.

### Alternatives considered

1. DOM and CSS layout
2. Canvas
3. SVG

### Why SVG was chosen

The rack editor is fundamentally geometric:

- rack positions are U-based
- devices occupy vertical slots
- ports need precise anchors
- wires are path-based connections

SVG fits that model well because:

- geometry is explicit
- zoom stays crisp
- pointer events work naturally on rendered nodes
- rack and device templates can be implemented as reusable SVG components

### Why not DOM and CSS

DOM is attractive at first because it is familiar, but it becomes awkward for:

- precise wire rendering
- port anchoring
- layered SVG-like geometry
- scaling complex rack scenes without layout drift

### Why not Canvas

Canvas would be reasonable for very dense scenes, but it would shift too much responsibility into custom code:

- hit testing
- accessibility
- pointer targeting
- redraw management

For the scaffold, that complexity would hide the architecture rather than clarify it.

### Resulting render model

The renderer is driven by placed records plus `templateKey`.

Example:

```json
{
  "id": "rack-device-app-server-01",
  "templateKey": "server-default",
  "startU": 4,
  "view": "front"
}
```

That same record can come from:

- API load
- drag and drop
- websocket replay

and the renderer still resolves the same way.

## Required Topic 2: Components

### Decision

Use shared UI primitives in packages and feature-specific modules in the app.

### Alternatives considered

1. One flat `components` folder
2. Strict feature-only organization with no shared UI package
3. Shared package for primitives plus feature folders for domain behavior

### Why this approach was chosen

This app has two very different kinds of code:

- reusable UI structure
- domain-specific editing logic

The split in this scaffold is:

- `packages/ui`
  - reusable primitives and compound components
- `packages/config`
  - stable contracts, token names, and metadata types
- `packages/device-templates`
  - device template registry and loaders
- `packages/rack-templates`
  - rack template registry and loaders
- `apps/web/src/features/rack`
  - detailed rack editing logic
- `apps/web/src/features/board`
  - board placement logic

This keeps the reusable render system separate from app-specific orchestration.

### Compound UI pattern

The scaffold uses compound components where composition reads better than prop-heavy flat components.

Examples:

- `Panel`
- `ControlGroup`
- `RackFrame`

That allows pages to compose scene structure like this:

```tsx
<RackFrame.Canvas>
  <RackFrame.Background />
  <RackFrame.Rails />
  <RackFrame.Markers />
</RackFrame.Canvas>
```

instead of pushing layout and style props down through multiple intermediary layers.

### How this helps with prop drilling

Prop drilling is reduced in two ways:

1. presentation structure is grouped into compound components rather than repeated prop wiring
2. state is moved into focused stores or hooks instead of being threaded through unrelated components

That makes the rack scene easier to read as composition rather than plumbing.

## Required Topic 3: Collaboration And Data Synchronization

### Decision

Use websocket-based collaboration with a clear split between:

- ephemeral presence updates
- committed document operations

### Alternatives considered

1. Polling
2. Whole-document replacement after every change
3. Typed document operations plus separate presence updates

### Why this approach was chosen

The rack editor is interaction-heavy. The user should not wait for a round trip to see basic results.

So the client should:

1. update locally for responsiveness
2. emit a typed change event
3. let the server validate and rebroadcast
4. let remote clients replay the same committed event

### Presence vs document state

Presence updates are temporary and high frequency:

- collaborator pointer
- drag preview
- online user presence

Document updates are lower frequency and persistent:

- device added
- device moved
- device removed
- connection added
- connection removed

This matters because presence should not mutate the rack document.

### Conflict strategy

The intended conflict model is optimistic concurrency with `revisionId`.

Simple flow:

1. client applies the change locally
2. client emits an operation with the last known revision
3. server validates against the authoritative revision
4. server accepts and rebroadcasts, or rejects stale writes

Example operation:

```json
{
  "type": "device.added",
  "rackId": "rack-a01",
  "revisionId": 13,
  "device": {
    "id": "device-srv-002",
    "templateKey": "server-default",
    "startU": 10,
    "view": "front"
  }
}
```

### Why not whole-document replacement

Replacing the whole document on every interaction is simpler to prototype, but it is weaker architecturally because it:

- increases payload size
- makes conflict reasoning less clear
- blurs the line between presence and committed state

Typed operations are easier to explain and easier to evolve.

## Optional Topic 1: State Management

### Decision

Use multiple focused Zustand stores instead of one global store.

### Alternatives considered

1. React Context for everything
2. One large Redux-style store
3. Multiple focused Zustand stores

### Why this approach was chosen

The app has clearly different state lifetimes:

- rack document state
- rack interaction state
- board viewport state
- collaboration presence
- theme state

Keeping them in separate stores makes the state boundaries easier to understand and helps reduce broad rerender pressure.

### Store boundaries

- `rackDocumentStore`
  - synced rack data and revision metadata
- `rackInteractionStore`
  - active drag, preview, active wire, current view
- `boardViewportStore`
  - board zoom
- `rackPresenceStore`
  - collaborators and temporary presence updates
- `themeStore`
  - active theme

### Why Zustand is useful here

The editor is layered:

- rack frame layer
- device layer
- wire layer
- presence layer
- overlay and preview layer

Those layers should not all rerender for the same reason.

The intended rule is:

- document changes rerender document-driven layers
- presence changes rerender presence-driven layers
- viewport changes rerender viewport-driven surfaces

Zustand helps because components can subscribe to narrow slices instead of inheriting one large app state object.

This is not a claim that the current implementation is perfectly optimized. It is the direction the scaffold is organized toward.

## Optional Topic 2: API Integration

### Decision

Use typed fetch helpers with React Query and a project-scoped loading model.

### Alternatives considered

1. Raw `fetch` inside components
2. One large nested project response
3. Typed fetch helpers with scoped routes and React Query

### Why this approach was chosen

The scaffold needs to communicate a realistic frontend loading strategy:

- project metadata loads first
- project-scoped rack metadata loads separately
- project-scoped device metadata loads separately
- rack document loads only when the detailed editor is opened

That structure is easier to cache and reason about than one oversized nested response.

### Intended route shape

```txt
POST /api/projects
GET /api/projects/:projectId
GET /api/projects/:projectId/racks
GET /api/projects/:projectId/devices
GET /api/racks/:rackId/document
WS  /ws?projectId=...&rackId=...
```

### Why project scoping matters

The platform may have a large master inventory.

For example:

- `500` rack metadata records
- `4000` device metadata records

During project creation, the user might select only:

- `30` racks
- `100` device metadata records

The frontend should operate inside that selected project scope rather than loading platform-wide data.

### Template loading strategy

The metadata can load first, while SVG template implementations resolve lazily only when needed.

That is why the scaffold uses:

- metadata lists in the board and inventory
- live template rendering only in active board nodes or rack scenes

## Configuration And Theme Boundary

Configuration is not treated as live application state.

`packages/config` defines the stable contracts that the rest of the app builds on:

- template keys
- shared TypeScript types
- port metadata
- token names

This keeps a clean distinction between:

- config
  - what kinds of things are allowed
- data
  - which project, rack, device, and connection records currently exist

Theme also follows this boundary:

- token names are stable config
- primitives consume semantic token classes
- `themeStore` only switches which token values are active

That means theme changes do not require rewriting component class names.

## Implementation Note

This scaffold is not presented as production-ready code.

The strongest and most reusable part of the implementation is the detailed rack editor demo and the shared template-driven rendering structure around it.

The board layer serves a different purpose:

- it was generated largely through AI-assisted prompting
- it was then manually simplified and corrected
- it exists to communicate product direction and loading strategy
- it is not yet the final optimized production architecture

So the correct reading is:

- the rack editor demo shows the stronger reusable implementation pattern
- the board shell shows how that editor can fit into a broader project-level workflow

## Outcome

This architecture gives the scaffold:

- a rendering model suited to rack geometry
- a clear component boundary between shared primitives and domain features
- a collaboration model that separates presence from committed state
- a state structure that supports layered rendering
- an API story that scales from project scope to rack scope
