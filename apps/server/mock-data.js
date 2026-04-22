export const devices = [
  {
    id: "server-1u",
    name: "Server (1U)",
    category: "server",
    templateKey: "server-default",
    uHeight: 1,
    ports: [
      { id: "eth-1", type: "ethernet" },
      { id: "eth-2", type: "ethernet" },
      { id: "mgmt-1", type: "console" },
    ],
  },
  {
    id: "switch-2u",
    name: "Switch (2U)",
    category: "switch",
    templateKey: "switch-default",
    uHeight: 2,
    ports: [
      { id: "eth-1", type: "ethernet" },
      { id: "eth-2", type: "ethernet" },
      { id: "eth-3", type: "ethernet" },
      { id: "eth-4", type: "ethernet" },
      { id: "eth-5", type: "ethernet" },
      { id: "eth-6", type: "ethernet" },
      { id: "uplink-1", type: "fiber" },
      { id: "uplink-2", type: "fiber" },
    ],
  },
  {
    id: "router-1u",
    name: "Router (1U)",
    category: "router",
    templateKey: "router-default",
    uHeight: 1,
    ports: [
      { id: "wan-1", type: "ethernet" },
      { id: "lan-1", type: "ethernet" },
      { id: "sfp-1", type: "fiber" },
      { id: "sfp-2", type: "fiber" },
    ],
  },
  {
    id: "patch-panel-1u",
    name: "Patch Panel (1U)",
    category: "patch-panel",
    templateKey: "patch-panel-default",
    uHeight: 1,
    ports: [
      { id: "port-1", type: "ethernet" },
      { id: "port-2", type: "ethernet" },
      { id: "port-3", type: "ethernet" },
      { id: "port-4", type: "ethernet" },
      { id: "port-5", type: "ethernet" },
      { id: "port-6", type: "ethernet" },
      { id: "port-7", type: "ethernet" },
      { id: "port-8", type: "ethernet" },
    ],
  },
  {
    id: "pdu-2u",
    name: "PDU (2U)",
    category: "pdu",
    templateKey: "pdu-default",
    uHeight: 2,
    ports: [
      { id: "outlet-1", type: "power" },
      { id: "outlet-2", type: "power" },
      { id: "outlet-3", type: "power" },
      { id: "outlet-4", type: "power" },
      { id: "outlet-5", type: "power" },
      { id: "outlet-6", type: "power" },
    ],
  },
  {
    id: "firewall-1u",
    name: "Firewall (1U)",
    category: "firewall",
    templateKey: "firewall-default",
    uHeight: 1,
    ports: [
      { id: "wan-1", type: "ethernet" },
      { id: "wan-2", type: "ethernet" },
      { id: "lan-1", type: "ethernet" },
      { id: "lan-2", type: "ethernet" },
      { id: "mgmt-1", type: "console" },
      { id: "mgmt-2", type: "console" },
    ],
  },
];

export const projects = [
  {
    id: "project-a",
    name: "Berlin Edge Rollout",
    description: "Retail edge racks, compact switching, and branch firewalls.",
    rackCount: 2,
    deviceCatalogCount: devices.length,
    racks: [
      {
        id: "berlin-edge-rack-42",
        name: "Primary Edge Rack",
        templateKey: "rack-42u",
        heightU: 42,
      },
      {
        id: "berlin-edge-rack-20",
        name: "Security Rack",
        templateKey: "rack-20u",
        heightU: 20,
      },
    ],
  },
  {
    id: "project-b",
    name: "Campus Network Refresh",
    description: "Core distribution upgrade across teaching blocks and labs.",
    rackCount: 2,
    deviceCatalogCount: devices.length,
    racks: [
      {
        id: "campus-core-rack-42",
        name: "Core Distribution Rack",
        templateKey: "rack-42u",
        heightU: 42,
      },
      {
        id: "campus-lab-rack-20",
        name: "Lab Network Rack",
        templateKey: "rack-20u",
        heightU: 20,
      },
    ],
  },
  {
    id: "project-c",
    name: "QA Lab Expansion",
    description: "Test racks for staging servers, patching, and power validation.",
    rackCount: 2,
    deviceCatalogCount: devices.length,
    racks: [
      {
        id: "qa-lab-rack-42",
        name: "Validation Rack",
        templateKey: "rack-42u",
        heightU: 42,
      },
      {
        id: "qa-power-rack-20",
        name: "Power and Patch Rack",
        templateKey: "rack-20u",
        heightU: 20,
      },
    ],
  },
];

export const rackDocument = {
  rackId: "rack-main",
  revisionId: 1,
  devices: [
    {
      id: "rack-device-patch-panel-a",
      templateKey: "patch-panel-default",
      startU: 30,
      view: "front",
    },
  ],
  connections: [],
};
