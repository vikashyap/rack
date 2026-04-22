# App Lifecycle And Data Flow

This document explains how data moves through the scaffold from top to bottom:

1. project creation or selection
2. project-scoped metadata loading
3. board-level rack placement
4. detailed rack document loading
5. drag and drop inside a rack
6. websocket collaboration
7. server persistence

The goal is to make the routes, IDs, JSON shapes, and store transformations easy to follow.

## 1. Top-Level Mental Model

The system hierarchy is:

```txt
Project
-> Board
-> Rack
-> Device
-> Port
-> Connection
```

Each level owns something different:

- `Project`
  - defines scope
- `Board`
  - shows project-level rack placement
- `Rack`
  - owns the live editable document
- `Device`
  - occupies rows inside a rack
- `Port`
  - exposes a connectable endpoint
- `Connection`
  - links one port to another

## 2. Main IDs In The System

These IDs are the backbone of the flow:

```txt
projectId
rackId
revisionId
device.id
connection.id
port.id
templateKey
```

Meaning:

- `projectId`
  - identifies project scope
- `rackId`
  - identifies the rack document
- `revisionId`
  - identifies the rack document version
- `device.id`
  - identifies one placed device record
- `connection.id`
  - identifies one cable record
- `port.id`
  - identifies a port inside a template
- `templateKey`
  - identifies which SVG template to render

Important rule:

```txt
id identifies a record
templateKey identifies a visual template
```

## 3. Intended API Shape

The intended route model is:

```txt
POST /api/projects
GET /api/projects/:projectId
GET /api/projects/:projectId/racks
GET /api/projects/:projectId/devices
GET /api/racks/:rackId/document
WS  /ws?projectId=...&rackId=...
```

The current scaffold uses a simpler mock server, but the frontend architecture is organized around this scoped version.

## 4. Step 1: User Creates Or Selects A Project

Before any rack document is loaded, the user either creates a project or selects an existing one.

The platform may have a much larger inventory:

- `500` rack metadata records
- `4000` device metadata records

During project creation, the user might choose only:

- `30` racks
- `100` device metadata records

That selected subset becomes the project scope.

### Example project creation request

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

### Example project creation response

```json
{
  "id": "project-a",
  "name": "Berlin Edge Rollout",
  "description": "Retail edge racks, compact switching, and branch firewalls.",
  "rackCount": 30,
  "deviceCatalogCount": 100
}
```

Important idea:

- the platform inventory is large
- the project scope is a selected subset
- the live tool should work inside that subset, not across the whole platform

## 5. Step 2: Home Page Loads Project Metadata

The app starts by loading lightweight project metadata.

### Request

```txt
GET /api/projects
```

### Example response

```json
[
  {
    "id": "project-a",
    "name": "Berlin Edge Rollout",
    "description": "Retail edge racks, compact switching, and branch firewalls.",
    "rackCount": 30,
    "deviceCatalogCount": 100
  }
]
```

At this stage:

- no rack document is loaded
- no rack scene is rendered
- the user is only choosing project scope

## 6. Step 3: User Opens A Project Board

After selecting a project, the route becomes:

```txt
/board/project-a
```

The board uses the selected `projectId` to load project-scoped metadata.

### Requests

```txt
GET /api/projects/project-a
GET /api/projects/project-a/racks
GET /api/projects/project-a/devices
```

### Example project metadata

```json
{
  "id": "project-a",
  "name": "Berlin Edge Rollout",
  "description": "Retail edge racks, compact switching, and branch firewalls.",
  "rackCount": 30,
  "deviceCatalogCount": 100
}
```

### Example rack metadata

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

### Example device metadata

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

- racks may be placed on the board
- devices are shown as project-scoped inventory
- devices are not dropped on the board background

Rule:

```txt
board accepts racks
racks accept devices
```

## 7. Step 4: User Opens The Detailed Rack Workflow

The detailed rack editor works from one rack document.

### Request

```txt
GET /api/racks/rack-a01/document
```

### Example response

```json
{
  "rackId": "rack-a01",
  "revisionId": 12,
  "devices": [
    {
      "id": "rack-device-app-server-01",
      "templateKey": "server-default",
      "startU": 4,
      "view": "front"
    },
    {
      "id": "rack-device-core-switch",
      "templateKey": "switch-default",
      "startU": 30,
      "view": "front"
    }
  ],
  "connections": [
    {
      "id": "conn-001",
      "from": {
        "deviceId": "rack-device-app-server-01",
        "portId": "eth-1"
      },
      "to": {
        "deviceId": "rack-device-core-switch",
        "portId": "eth-3"
      }
    }
  ]
}
```

This response is the API document shape.

## 8. Step 5: API Document Becomes Normalized Store State

The rack editor normalizes the API document into lookup-friendly store state.

### API shape

```ts
type RackDocumentResponse = {
  rackId: string;
  revisionId: number;
  devices: RackDeviceRecord[];
  connections: RackConnection[];
};
```

### Normalized store shape

This matches the actual `rackDocumentStore` shape used in the app:

```ts
export type RackDocumentState = {
  rackId: string;
  revisionId: number;
  deviceIds: string[];
  devicesById: Record<string, RackDeviceRecord>;
  connectionIds: string[];
  connectionsById: Record<string, RackConnection>;
};
```

### Example normalized result

```json
{
  "rackId": "rack-a01",
  "revisionId": 12,
  "deviceIds": [
    "rack-device-app-server-01",
    "rack-device-core-switch"
  ],
  "devicesById": {
    "rack-device-app-server-01": {
      "id": "rack-device-app-server-01",
      "templateKey": "server-default",
      "startU": 4,
      "view": "front"
    },
    "rack-device-core-switch": {
      "id": "rack-device-core-switch",
      "templateKey": "switch-default",
      "startU": 30,
      "view": "front"
    }
  },
  "connectionIds": ["conn-001"],
  "connectionsById": {
    "conn-001": {
      "id": "conn-001",
      "from": {
        "deviceId": "rack-device-app-server-01",
        "portId": "eth-1"
      },
      "to": {
        "deviceId": "rack-device-core-switch",
        "portId": "eth-3"
      }
    }
  }
}
```

This normalized shape is useful because:

- device lookup is cheap
- connection lookup is cheap
- updates can target one device or connection without scanning the whole array every time

## 9. Step 6: Metadata Plus Record Becomes Rendered Device

The rack document does not include the full device metadata object.

The placed record:

```json
{
  "id": "rack-device-app-server-01",
  "templateKey": "server-default",
  "startU": 4,
  "view": "front"
}
```

is combined with project-scoped device metadata:

```json
{
  "id": "server-1u",
  "name": "Server (1U)",
  "category": "server",
  "templateKey": "server-default",
  "uHeight": 1,
  "ports": [
    { "id": "eth-1", "type": "ethernet" },
    { "id": "eth-2", "type": "ethernet" }
  ]
}
```

That combination gives the renderer enough information to produce the final SVG:

```txt
placed record
+ template metadata
+ template implementation
= rendered rack device
```

## 10. Step 7: Dragging A Device Into A Rack

The inventory drag payload is intentionally small.

### Drag payload

```json
{
  "kind": "template",
  "id": "server-1u"
}
```

On drop, the client converts that metadata item into a placed rack record:

```json
{
  "id": "rack-device-app-server-02",
  "templateKey": "server-default",
  "startU": 10,
  "view": "front"
}
```

Then the document store updates.

## 11. Step 8: Local Mutation Becomes A Websocket Operation

The client applies the edit optimistically, then emits a committed operation.

### Example websocket document operation

```json
{
  "type": "device.added",
  "rackId": "rack-a01",
  "revisionId": 13,
  "device": {
    "id": "rack-device-app-server-02",
    "templateKey": "server-default",
    "startU": 10,
    "view": "front"
  }
}
```

This is different from presence updates.

### Presence update example

```json
{
  "type": "presence.updated",
  "projectId": "project-a",
  "rackId": "rack-a01",
  "userId": "user-2",
  "pointer": {
    "x": 420,
    "y": 812
  }
}
```

Important separation:

```txt
presence = temporary
document operations = committed
```

## 12. Step 9: Server Persists And Rebroadcasts

The intended persistence flow is:

1. client applies change locally
2. client sends typed operation
3. server validates against `revisionId`
4. server persists the new document state
5. server rebroadcasts the accepted operation

If the client is stale, the server can reject the write based on revision mismatch.

### Example accepted response shape

```json
{
  "status": "accepted",
  "rackId": "rack-a01",
  "revisionId": 13
}
```

### Example conflict response shape

```json
{
  "status": "conflict",
  "rackId": "rack-a01",
  "expectedRevisionId": 13,
  "receivedRevisionId": 12
}
```

## 13. Why This Flow Matters

This structure keeps the layers clear:

- project scope decides what metadata is available
- board shows project-level rack placement
- rack document owns editable state
- inventory metadata is lightweight
- rendered templates load lazily
- websocket presence stays separate from committed document operations
- normalized store state keeps updates and lookups manageable
