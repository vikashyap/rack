# App Lifecycle And Data Flow

This document explains how data flows through the app from top to bottom:

1. project creation or selection
2. project metadata loading
3. project-scoped rack and device loading
4. rack document loading
5. device drag into a rack
6. websocket collaboration
7. final persistence back to the server

The goal is to make the IDs, routes, and JSON shapes easy to follow.

## 1. Top-Level Mental Model

The app is built around a simple hierarchy:

```txt
Project
-> Board
-> Rack
-> Device
-> Port
-> Connection
```

Each level has its own job:

- a `project` scopes which racks and device templates are available
- a `board` shows project-level layout and rack placement
- a `rack` owns the detailed document being edited
- a `device` is a placed template inside a rack
- a `port` is a connectable endpoint on a device
- a `connection` links two ports together

## 2. Main IDs Used In The System

These IDs are the backbone of the whole flow:

```txt
projectId
rackId
revisionId
device.id
connection.id
port.id
templateKey
```

They mean different things:

- `projectId` identifies the project context
- `rackId` identifies the rack document being edited
- `revisionId` identifies the current rack document version
- `device.id` identifies one placed device record inside a rack
- `connection.id` identifies one cable record
- `port.id` identifies one port inside a template
- `templateKey` identifies which SVG template to render

Important rule:

```txt
id identifies a record
templateKey identifies a visual template
```

## 3. API Routes Used Today

The mock server currently exposes three main GET routes:

```txt
GET /api/projects
GET /api/devices
GET /api/rack-document
```

And one websocket endpoint:

```txt
GET /ws
```

In a production version, the same flow would usually become more scoped:

```txt
POST /api/projects
GET /api/projects/:projectId
GET /api/projects/:projectId/racks
GET /api/projects/:projectId/devices
GET /api/racks/:rackId/document
WS  /ws?projectId=...&rackId=...
```

The scaffold keeps the routes simpler, but the data flow is already shaped for that future version.

## 4. Step 1: User Creates Or Selects A Project

Before any rack data is loaded, the user either creates a project or selects an existing one.

A simple example is:

- the full platform may contain `500` rack metadata records
- the full platform may contain `4000` device metadata records
- during project creation, the user may choose only `30` racks and `100` device metadata records for this project

That selected subset becomes the project scope.

A production flow would usually start with:

```txt
POST /api/projects
```

Example create request:

```json
{
  "name": "Berlin Edge Rollout",
  "customerId": "customer-acme",
  "region": "berlin",
  "selectedRackIds": [
    "platform-rack-001",
    "platform-rack-014",
    "platform-rack-207"
  ],
  "selectedDeviceCatalogIds": [
    "platform-device-server-1u",
    "platform-device-switch-2u",
    "platform-device-firewall-1u"
  ]
}
```

Example create response:

```json
{
  "id": "project-a",
  "name": "Berlin Edge Rollout",
  "description": "Retail edge racks, compact switching, and branch firewalls.",
  "rackCount": 30,
  "deviceCatalogCount": 500
}
```

The important idea is that project creation selects a subset from the larger platform inventory.

For example:

- the whole platform may contain hundreds of rack metadata records
- the whole platform may contain thousands of device metadata records
- project creation chooses only the racks and device metadata relevant to this project
- the created project may end up with something smaller, such as `30` racks and `500` device metadata records

That still does not mean the live rack editor loads all of that data at once.

Instead:

- project creation defines the project-scoped subset
- project routes return metadata for that subset
- the live board and rack editor boot from that scoped metadata
- SVG template implementations resolve lazily only when the board or rack needs them

The scaffold starts from the simpler version where projects already exist, so the first visible step is project selection.

## 5. Step 2: Home Page Loads Project Metadata

The app starts on `HomePage`.

The frontend calls:

```txt
GET /api/projects
```

Example response:

```json
[
  {
    "id": "project-a",
    "name": "Berlin Edge Rollout",
    "description": "Retail edge racks, compact switching, and branch firewalls."
  }
]
```

At this stage:

- the app only knows project metadata
- no rack document is loaded yet
- no devices are placed yet
- the user is only choosing a project context

## 6. Step 3: User Opens A Project Board

After the user clicks a project card, the route becomes:

```txt
/board/project-a
```

The board page uses the selected `projectId` to load:

- which racks belong to the project
- which device catalog belongs to the project

In the intended backend shape, those are separate routes:

```txt
GET /api/projects/project-a
GET /api/projects/project-a/racks
GET /api/projects/project-a/devices
```

Example project metadata response:

```json
{
  "id": "project-a",
  "name": "Berlin Edge Rollout",
  "description": "Retail edge racks, compact switching, and branch firewalls.",
  "rackCount": 30,
  "deviceCatalogCount": 500
}
```

Example rack metadata response:

```json
[
  {
    "id": "berlin-edge-rack-42",
    "name": "Primary Edge Rack",
    "templateKey": "rack-42u",
    "heightU": 42
  },
  {
    "id": "berlin-edge-rack-20",
    "name": "Security Rack",
    "templateKey": "rack-20u",
    "heightU": 20
  }
]
```

At this stage, the app is still dealing with project-scoped metadata, not full live rack documents.

That distinction matters:

- the platform owns the full rack and device inventory
- project creation chooses a subset from that platform inventory
- project routes return metadata for that selected subset
- rack document routes return the live placed state for one selected rack

Example device catalog response:

```json
[
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
  },
  {
    "id": "switch-2u",
    "name": "Switch (2U)",
    "category": "switch",
    "templateKey": "switch-default",
    "uHeight": 2,
    "ports": [
      { "id": "eth-1", "type": "ethernet" },
      { "id": "eth-2", "type": "ethernet" },
      { "id": "uplink-1", "type": "fiber" }
    ]
  }
]
```

At the board level:

- racks can be placed on the board
- devices are visible as project-scoped inventory
- devices are not dropped onto the board itself

That rule is intentional:

```txt
board accepts racks
racks accept devices
```

In other words, the better lifecycle is:

```txt
project metadata
+ project racks
+ project devices
```

not one large nested project payload.

## 7. Step 4: User Opens The Detailed Rack Workflow

The detailed rack editor works from a rack document.

The frontend calls:

```txt
GET /api/rack-document
```

Example response:

```json
{
  "rackId": "rack-main",
  "revisionId": 1,
  "devices": [
    {
      "id": "rack-device-core-switch",
      "templateKey": "switch-default",
      "startU": 30,
      "view": "front"
    },
    {
      "id": "rack-device-app-server-01",
      "templateKey": "server-default",
      "startU": 4,
      "view": "front"
    }
  ],
  "connections": []
}
```

This response seeds the main synced document store.

At this point:

- `rackId` tells us which rack document we are editing
- `revisionId` tells us which version of the document we are on
- `devices` are compact placement records
- `connections` are wire records

## 8. Step 5: How Device Templates Turn Into Rack Devices

The rack document does not contain the full device template payload.

It only contains the placed record:

```json
{
  "id": "rack-device-app-server-01",
  "templateKey": "server-default",
  "startU": 4,
  "view": "front"
}
```

The frontend combines that placed record with the device catalog entry:

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

That merge gives the renderer enough information to draw the device:

```txt
placed device record
+ template config
= rendered rack device
```

This is why `templateKey` matters so much. The same placed record can be rendered correctly whether it came from:

- initial API load
- local drag and drop
- websocket replay

## 9. Step 6: User Drags A Device Into A Rack

The drag starts from an inventory item.

The inventory-side drag payload is intentionally small:

```json
{
  "kind": "template",
  "id": "server-1u"
}
```

That `id` is the catalog item ID, not the final placed device ID.

When the user drops it into the rack, the UI resolves the inventory item into a placed record:

```json
{
  "id": "rack-device-server-003",
  "templateKey": "server-default",
  "startU": 10,
  "view": "front"
}
```

That placed record is then inserted into the rack document state.

So the local flow is:

```txt
inventory item
-> resolve template
-> calculate startU
-> create placed device record
-> update rack document store
```

## 10. Step 7: User Connects Two Ports

Connections are stored with device IDs and port IDs, not pixel coordinates.

Example:

```json
{
  "id": "conn-002",
  "from": {
    "deviceId": "rack-device-app-server-01",
    "portId": "eth-1"
  },
  "to": {
    "deviceId": "rack-device-core-switch",
    "portId": "eth-4"
  }
}
```

That is important because the backend does not need to know SVG positions.

The frontend derives the wire path from:

- the device placement
- the template port definitions
- the current rack layout rules

So the backend stores logical relationships:

```txt
this port is connected to that port
```

and the frontend calculates:

```txt
where those ports appear on screen
```

## 11. Step 8: Presence Over Websocket

While a user is dragging, we do not send the whole rack document.

We send temporary presence data over websocket.

Example presence message:

```json
{
  "type": "presence",
  "pointer": {
    "x": 612,
    "y": 284,
    "view": "front"
  },
  "dragPreview": {
    "name": "Server (1U)",
    "heightU": 1,
    "startU": 10,
    "view": "front",
    "isValid": true
  }
}
```

This is not persisted.

It is only for live collaboration UI:

- remote pointers
- remote drag previews
- awareness of what another user is doing right now

This belongs to the presence layer, not the document layer.

## 12. Step 9: Committed Rack Changes Over Websocket

After a user finishes a real edit, the app sends a typed operation.

Example:

```json
{
  "type": "operation",
  "operation": {
    "type": "device.added",
    "rackId": "rack-main",
    "revisionId": 2,
    "device": {
      "id": "rack-device-server-003",
      "templateKey": "server-default",
      "startU": 10,
      "view": "front"
    }
  }
}
```

Other clients receive that operation and replay it into their own rack document store.

That means the shared model is:

```txt
presence for temporary actions
operations for committed document changes
```

## 13. Step 10: Final Push Back To The Server

The mock server currently rebroadcasts websocket operations but does not persist writes yet.

The intended production flow is:

1. user commits an edit locally
2. local UI updates optimistically
3. app sends a typed rack operation with `rackId` and `revisionId`
4. backend validates the operation
5. backend persists the new rack document state
6. backend increments the `revisionId`
7. backend rebroadcasts the confirmed operation

Example operation sent for persistence:

```json
{
  "type": "device.moved",
  "rackId": "rack-main",
  "revisionId": 3,
  "deviceId": "rack-device-core-switch",
  "startU": 28
}
```

In a full API design, that would likely become a route such as:

```txt
POST /api/racks/rack-main/operations
```

with a request body like:

```json
{
  "revisionId": 3,
  "operation": {
    "type": "device.moved",
    "deviceId": "rack-device-core-switch",
    "startU": 28
  }
}
```

## 14. Why `revisionId` Matters

`revisionId` is the lightweight conflict model for the rack document.

Simple example:

```txt
User A opens rack-main at revision 3
User B opens rack-main at revision 3
```

User A moves a device first:

```json
{
  "type": "device.moved",
  "rackId": "rack-main",
  "revisionId": 4,
  "deviceId": "rack-device-core-switch",
  "startU": 28
}
```

Now the document version is newer.

If User B tries to commit an older change based on the stale version, the backend can reject it and ask the client to refresh.

That means:

```txt
presence can be frequent and temporary
document writes must be version-aware
```

## 15. Full Lifecycle In One Example

Here is the complete flow in one short story.

### A. User creates or selects a project

```txt
GET /api/projects
-> project-a selected
```

### B. Board loads project metadata, project racks, and project devices

```txt
GET /api/projects/project-a
GET /api/projects/project-a/racks
GET /api/projects/project-a/devices
```

### C. User opens the rack editor for one rack

```txt
GET /api/racks/rack-main/document
```

### D. User drags a server from inventory into the rack

Input drag payload:

```json
{
  "kind": "template",
  "id": "server-1u"
}
```

Resolved placed record:

```json
{
  "id": "rack-device-server-003",
  "templateKey": "server-default",
  "startU": 10,
  "view": "front"
}
```

### E. Other users see the drag preview

```json
{
  "type": "presence",
  "pointer": { "x": 612, "y": 284, "view": "front" },
  "dragPreview": {
    "name": "Server (1U)",
    "heightU": 1,
    "startU": 10,
    "view": "front",
    "isValid": true
  }
}
```

### F. Drop is committed

```json
{
  "type": "operation",
  "operation": {
    "type": "device.added",
    "rackId": "rack-main",
    "revisionId": 2,
    "device": {
      "id": "rack-device-server-003",
      "templateKey": "server-default",
      "startU": 10,
      "view": "front"
    }
  }
}
```

### G. Backend persists and rebroadcasts

```txt
operation accepted
revisionId increments
other clients replay the same operation
```

## 16. Final Summary

The app follows one simple pattern from top to bottom:

```txt
project is created or selected
project metadata loads first
project racks and project devices load through separate routes
board chooses rack context
rack document stores placed records
templateKey resolves SVG templates
presence shows temporary live actions
operations sync committed document changes
server persistence finalizes the document
```

That is the core lifecycle of the current scaffold.
