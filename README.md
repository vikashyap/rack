# Pathfinder Web Rack View

This repo is a scaffold for an interactive rack view inside Pathfinder Web. The goal of this README is to help a junior developer understand the app story, the data flow, and where the main workflow lives.

## Big Picture

Pathfinder Web manages physical infrastructure.

- A company becomes a project.
- A project owns a selected set of racks.
- Each rack contains selected devices.
- Devices expose ports.
- Ports can be connected with cables.

In this scaffold:

- `HomePage` explains project entry.
- `BoardPage` explains project-level loading and multi-rack placement.
- `RackPage` is the main detailed workflow.

The real editing experience happens in `RackPage`.

## Why `HomePage` And `BoardPage` Exist

These pages are here to explain the product shape before the detailed rack editor opens.

- `HomePage` is the project chooser.
- `BoardPage` shows how a selected project loads its racks and devices.
- `BoardPage` also shows how multiple racks can exist in one workspace.

The board is intentionally an overview. It is not the full rack editor. It exists so the user can understand:

1. which project is active
2. which racks belong to that project
3. how racks are placed in a larger workspace

## Project Story

Assume the full platform has millions of rack records and a very large device catalog.

We do not want to load all rack and device templates in the first JavaScript bundle.

Instead, the workflow is:

1. user creates or selects a project
2. project creation selects the relevant racks and device metadata from the larger platform inventory
3. project metadata loads first
4. project racks load from a project-scoped racks route
5. project devices load from a project-scoped devices route
6. UI first works with lightweight metadata
7. full template implementations load only when needed

This keeps the initial load smaller and makes the app easier to scale.

## Example: Project Payload

This is the kind of lightweight project metadata the UI is built around:

```json
{
  "id": "project-acme-berlin",
  "name": "ACME Berlin DC",
  "description": "Regional core and edge rollout for ACME Berlin.",
  "rackCount": 30,
  "deviceCatalogCount": 500
}
```

The important idea is:

- `id` identifies the record
- `templateKey` identifies which SVG template to render

After that, the app loads project-scoped resources from separate routes instead of one nested response.

Example:

```txt
GET /api/projects/:projectId
GET /api/projects/:projectId/racks
GET /api/projects/:projectId/devices
```

Example rack metadata:

```json
[
  {
    "id": "rack-a01",
    "name": "Core Rack A01",
    "templateKey": "rack-42u",
    "heightU": 42
  },
  {
    "id": "rack-b07",
    "name": "Edge Rack B07",
    "templateKey": "rack-20u",
    "heightU": 20
  }
]
```

That separation matters because project metadata, rack metadata, and device catalog data do not need the same loading or caching behavior.

It also supports a more realistic creation flow:

- the platform may contain a much larger master inventory of racks and devices
- project creation chooses only the relevant subset for that project
- the board and rack pages then load only the metadata they actually need
- the live board resolves template implementations lazily instead of loading every template up front

## Rack Document Story

Once the user opens one rack, the detailed page works from a rack document.

Example:

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
    },
    {
      "id": "device-sw-001",
      "templateKey": "switch-default",
      "startU": 40,
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

This is the main workflow inside `RackPage`:

- render the selected rack
- place devices into rack units
- start a cable from one port
- finish it on another port
- sync updates with other users

## How Templates Work

Template contracts and shared config live in `packages/config`.

Runtime template loading lives in separate UI/template packages:

- `packages/device-templates` for device template loaders
- `packages/ui` for rack template registry and reusable rack primitives

The runtime pattern is simple:

- keep stable record IDs in state
- use `templateKey` to resolve the correct SVG template
- render the same way whether data came from API, drag-and-drop, or websocket replay

Example:

```json
{
  "id": "device-srv-001",
  "templateKey": "server-default"
}
```

This means:

- `id` tells us which placed device we are dealing with
- `templateKey` tells `DeviceTemplate.Auto` which SVG component to load

## Where Rules And Config Live

The project uses the word "config" in a specific way.

Config is where shared rules and contracts live. It is not where live rack state lives.

For example, `packages/config` owns things like:

- template keys such as `server-default` and `rack-42u`
- shared TypeScript types for device templates, rack templates, and ports
- category and port metadata
- design token definitions exposed to Tailwind

That means config answers questions like:

- what kinds of devices exist?
- what port types exist?
- what rack template keys are allowed?
- what token names can UI primitives use?

Application state answers different questions:

- which project is open?
- which rack document is active?
- which devices are placed in this rack?
- which collaborators are online?

That split is intentional:

- `packages/config` defines the stable rules
- stores and API responses hold the changing data

## How Theming Works

Theming is shared, but it is also intentionally lightweight.

The current setup is:

1. `packages/config/tailwind.css` defines the design token contract.
2. Tailwind maps those tokens into utility names like `bg-ui-surface-bg`, `border-ui-surface-border`, and `text-ui-text-strong`.
3. UI primitives in `packages/ui` use those token-based utility classes instead of hard-coded colors.
4. `themeStore` switches between dark and light token sets by toggling the `theme-light` class on the root document element.

The important idea is that primitives do not know specific hex colors. They only know semantic tokens.

So instead of writing:

```txt
bg-slate-900
border-white/10
text-white
```

the primitives use:

```txt
bg-ui-surface-bg
border-ui-surface-border
text-ui-text-strong
```

This makes theme changes easier because a new theme does not require rewriting component class names. We only need to provide different token values.

## How Tailwind Fits Into The Theme System

Tailwind is not used here as an open-ended color picker.

Instead, Tailwind is being used as a token consumer.

The important piece is the `@theme inline` block in [tailwind.css](/Users/vikashyap/projects/rack/packages/config/tailwind.css). It maps CSS custom properties into Tailwind utilities:

- `--ui-surface-bg` becomes `bg-ui-surface-bg`
- `--ui-surface-border` becomes `border-ui-surface-border`
- `--ui-text-strong` becomes `text-ui-text-strong`
- spacing, radius, shadow, and text sizes are also mapped the same way

Then the base layer defines actual token values for:

- dark theme in `:root`
- light theme in `.theme-light`
- device-category overrides such as `[data-category="server"]`

This gives us a clean chain:

```txt
theme class
-> CSS token values
-> Tailwind token utilities
-> shared UI primitives
-> app screens
```

In other words:

- config owns the token names
- Tailwind exposes them as utilities
- primitives consume those utilities
- the active theme swaps the values behind the tokens

## How Ports Work

Ports are not hard-coded inside page components. They are resolved from template config and used consistently by the rack wiring logic.

Example device catalog entry:

```json
{
  "id": "inventory-server-2u",
  "name": "2U Server",
  "category": "server",
  "templateKey": "server-default",
  "uHeight": 2,
  "ports": [
    { "id": "server-default-1", "type": "ethernet" },
    { "id": "server-default-2", "type": "ethernet" },
    { "id": "server-default-3", "type": "power" }
  ]
}
```

The port flow is:

1. server returns the template config
2. template config defines the ports
3. device template renders those ports
4. wiring logic reads `deviceId` + `portId`
5. connection state stores those endpoint IDs

Example connection:

```json
{
  "id": "conn-002",
  "from": {
    "deviceId": "device-srv-001",
    "portId": "server-default-1"
  },
  "to": {
    "deviceId": "device-sw-001",
    "portId": "switch-default-5"
  }
}
```

## How Port And Wire Calculation Works

The rack does not store hard-coded pixel coordinates for ports. It calculates them from a small layout config plus the current device placement.

The calculation path is:

1. `resolveTemplatePorts` gets the list of ports from the device template config.
2. `resolveDevicePortLayout` uses a small category-based layout spec to decide:
   - how many ports to show
   - horizontal gap between ports
   - port size
   - starting X offset
   - port Y position
3. `resolveDevicePortAnchor` finds the exact port anchor inside the device.
4. `getRackDevicePortAnchor` converts that local anchor into rack-level SVG coordinates.
5. `buildRackWirePath` builds a cubic bezier curve between the two anchors.

The layout config is intentionally small. For example, device categories like `server`, `switch`, and `patch-panel` each have different values for:

- `rackCount`
- `compactCount`
- `rackGap`
- `compactGap`
- `startXOffset`

That gives us consistent port placement without hard-coding every device by hand.

The final wire path is also simple by design:

- start at the source port anchor
- end at the destination port anchor
- place the bezier control point farther to the right so the cable bends smoothly

This is enough for the challenge because it keeps the wiring logic readable and reusable.

## Drag, Drop, And Realtime Sync

The same ID philosophy is reused across the whole app.

### From catalog drag

```json
{
  "kind": "template",
  "id": "inventory-server-2u"
}
```

On drop, that catalog item becomes a placed device record:

```json
{
  "id": "device-srv-002",
  "templateKey": "server-default",
  "startU": 10,
  "view": "front"
}
```

### From websocket sync

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

The important part is that the render system does not care whether the record came from:

- initial API load
- local drag-and-drop
- websocket replay

It resolves the same way every time:

1. get the record by `id`
2. use `templateKey` to resolve the template
3. render the SVG

## Where State Lives

The app keeps different concerns in different stores:

- `rackDocumentStore` for devices, connections, rack ID, and revision ID
- `rackInteractionStore` for drag state, preview state, active connection, and current view
- `boardViewportStore` for zoom
- `rackPresenceStore` for collaborators
- `themeStore` for theme

This split matters because drag state changes often, while document state is the thing we sync and persist.

## Folder Guide

- `apps/web` is the React app
- `apps/server` is the mock backend
- `packages/ui` contains reusable UI pieces
- `packages/config` contains shared types and design tokens
- `packages/device-templates` contains device template loaders

Good starting points:

- [BoardPage.tsx](/Users/vikashyap/projects/rack/apps/web/src/pages/BoardPage.tsx)
- [RackPage.tsx](/Users/vikashyap/projects/rack/apps/web/src/pages/RackPage.tsx)
- [RackScene.tsx](/Users/vikashyap/projects/rack/apps/web/src/features/rack/RackScene.tsx)
- [rackDocumentStore.ts](/Users/vikashyap/projects/rack/apps/web/src/stores/rackDocumentStore.ts)
- [rackInteractionStore.ts](/Users/vikashyap/projects/rack/apps/web/src/stores/rackInteractionStore.ts)

## Local Setup

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the workspace in development mode:

- `apps/web` starts the Vite frontend
- `apps/server` starts the mock API and websocket server on port `3001`

The frontend proxies:

- `/api` to `http://localhost:3001`
- `/ws` to `ws://localhost:3001`

After starting the app, open the local Vite URL shown in the terminal. From there:

1. open the home page
2. choose a project
3. inspect the project board
4. open the detailed rack workflow

Other useful commands:

```bash
pnpm typecheck
pnpm build
pnpm check:styles
```

## Final Notes

- Keep `id` and `templateKey` mentally separate.
- `id` identifies the record.
- `templateKey` selects the SVG template.
- `RackPage` is the main workflow.
- `HomePage` and `BoardPage` are here to explain project context and loading strategy.

- `ADR.md` explains the architecture decisions.
- `APP_LIFECYCLE.md` explains the end-to-end data flow with routes, IDs, and JSON examples.
- `AI_LOG.md` explains how AI was used.
