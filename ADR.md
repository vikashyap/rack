# Architecture Decision Record: Pathfinder Web Rack View

## Status
Accepted for the take-home scaffold.

## Context

The Rack View must support:

- viewing and editing a rack layout
- dragging devices into rack slots
- connecting device ports
- seeing live edits from collaborators

The platform also needs a project-level flow where a company or customer context becomes a project, racks are assigned to that project, devices are assigned to that project, and only the needed templates are loaded.

This ADR covers the three required topics and two optional topics:

- Rendering
- Components
- Collaboration & Data Synchronization
- State Management
- API Integration

## 1. Rendering

### Decision

Use SVG as the primary rendering layer for racks, devices, ports, and wires.

### Alternatives considered

1. DOM and CSS layout
2. Canvas
3. SVG

### Why SVG

- Rack U positions, device blocks, and port anchors are geometric.
- Zooming must stay crisp.
- React pointer events work naturally on SVG nodes.
- Device and rack templates can be exported from Figma-like tools and wrapped directly in code.

### Why not the others

- DOM and CSS become awkward for precision layout and wire rendering.
- Canvas is fast, but it pushes event hit-testing and accessibility work back onto the app.

### Code shape

The render path is intentionally generic:

```json
{
  "id": "device-srv-001",
  "templateKey": "server-default",
  "startU": 18,
  "view": "front"
}
```

- `id` identifies the placed record
- `templateKey` identifies the SVG template

That record can come from:

- server load
- drag-and-drop
- websocket replay

and the renderer still resolves the same way.

## 2. Components

### Decision

Use shared UI primitives in packages and feature modules in the app.

### Alternatives considered

1. One flat `components` folder
2. Very strict feature-sliced architecture
3. Shared UI package plus feature folders

### Why this approach

The app has two very different types of code:

- reusable UI like panels, shells, and frame primitives
- domain-specific rack behavior like placement, wiring, and collaboration

So the split is:

- `packages/ui` for reusable UI
- `apps/web/src/features/rack` for rack behavior
- `apps/web/src/features/board` for project board behavior

### Why this matters

It keeps the main workflow clear:

1. `HomePage` selects project context
2. `BoardPage` explains project-level loading and multi-rack layout
3. `RackPage` handles the detailed rack workflow

The board pages exist to explain the system. The detailed editing workflow lives in the rack page.

### Configuration and theming boundary

Component composition depends on a shared config and token layer.

The boundary is:

- `packages/config` owns template contracts, shared types, port metadata, rack metadata, and design token names
- `packages/ui` owns reusable primitives that consume those tokens
- `apps/web` owns screen composition, state, and API wiring

This keeps the UI primitives headless enough to be reused while still giving the app a controlled visual system.

Theming is handled through semantic Tailwind token utilities rather than raw utility colors.

Example:

- primitives use `bg-ui-surface-bg`, `border-ui-surface-border`, and `text-ui-text-strong`
- the active theme changes the underlying CSS variable values

So changing theme does not require rewriting component class names. It only requires supplying a different token set.

## 3. Collaboration & Data Synchronization

### Decision

Use optimistic local updates and typed websocket operations.

### Alternatives considered

1. Polling
2. Full document replacement
3. Typed operations over websocket

### Why this approach

The rack editor is interaction-heavy. The user should not wait for a round trip just to see a drag result.

Typed operations give us:

- immediate local feedback
- a smaller sync payload
- clearer conflict handling than replacing the whole document every time

### Example

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

### Conflict model

The practical flow is:

1. apply local change immediately
2. increment `revisionId`
3. emit a typed operation
4. let the server validate and rebroadcast
5. remote clients replay the same operation

Presence is kept separate from the rack document so pointer movement does not mutate the document itself.

## 4. State Management

### Decision

Split state into bounded Zustand stores.

### Alternatives considered

1. React Context
2. One global Redux-style store
3. Multiple focused Zustand stores

### Why this approach

The app has different state lifetimes:

- document state
- interaction state
- viewport state
- presence state
- theme state

Keeping them separate avoids unnecessary re-renders and makes the code easier to reason about.

### State boundaries

- `rackDocumentStore` is the source of truth for synced rack data
- `rackInteractionStore` handles drag, preview, current view, and active connection
- `boardViewportStore` handles zoom
- `rackPresenceStore` handles collaborator presence
- `themeStore` handles the active token set by toggling the root theme class

### ID strategy

The state is normalized around IDs:

- `projectId`
- `rackId`
- `deviceId`
- `connectionId`
- `portId`
- `templateKey`
- `revisionId`

Example rack document:

```json
{
  "rackId": "rack-a01",
  "revisionId": 12,
  "devices": [
    {
      "id": "device-srv-001",
      "templateKey": "server-default",
      "startU": 18,
      "view": "front"
    }
  ],
  "connections": [
    {
      "id": "conn-001",
      "from": {
        "deviceId": "device-srv-001",
        "portId": "server-default-1"
      },
      "to": {
        "deviceId": "device-sw-001",
        "portId": "switch-default-3"
      }
    }
  ]
}
```

This is the same model used for API load, local drop, and websocket replay.

## 5. API Integration

### Decision

Use typed fetch helpers with React Query.

### Alternatives considered

1. Raw `fetch` inside components
2. Custom cache layer
3. Typed fetch helpers plus React Query

### Why this approach

- fetch logic stays out of UI components
- loading and caching are standardized
- request and response types stay explicit
- the pattern can later be swapped for generated .NET contracts

### Project-scoped loading strategy

The most important API decision in this scaffold is to load project-scoped data first.

Example:

```json
{
  "id": "project-acme-berlin",
  "name": "ACME Berlin DC",
  "description": "Regional core and edge rollout for ACME Berlin.",
  "rackCount": 30,
  "deviceCatalogCount": 500
}
```

Then load project-scoped resources through separate routes such as:

```txt
POST /api/projects
GET /api/projects/:projectId
GET /api/projects/:projectId/racks
GET /api/projects/:projectId/devices
```

This avoids shipping every rack and device template in the first bundle, and it keeps project metadata, rack metadata, and device catalog loading separate.

It also supports a better creation flow: the platform can own a much larger master inventory, project creation can choose only the racks and device metadata relevant to that project, and the UI still loads only the project-scoped subset it needs for the current screen. The actual SVG template implementations are resolved lazily when the live board or rack editor needs them.

## Config Philosophy

Configuration is not treated as live application state.

Instead, config defines the stable rules that the rest of the app builds on:

- device template keys
- rack template keys
- port definitions
- shared type contracts
- design token names

This means the app can keep a clean split between:

- config: what kinds of things are allowed and how primitives are styled
- data: which project, rack, device, and connection records currently exist

That distinction matters for maintainability because template contracts and theme token names should change much less often than live rack documents or collaboration state.

## Project Template Philosophy

Projects are the loading boundary.

- templates are registered in separate rack and device packages
- projects select the subset of racks and devices they need
- the UI works first from lightweight metadata
- full templates are resolved only when the project and rack context are known

This also supports team ownership:

- one team can refine rack templates
- another can refine device templates
- the core app consumes both through the same `templateKey` contract

## Outcome

This architecture gives us:

- a rendering model suited to rack geometry
- a clear split between reusable UI and rack-specific logic
- a practical collaboration model
- normalized state with reusable ID patterns
- project-scoped template loading that scales better
