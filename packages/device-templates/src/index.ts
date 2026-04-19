import type { DeviceTemplateComponent, DeviceTemplateKey } from "@repo/config";

export type DeviceTemplateLoader = () => Promise<{ default: DeviceTemplateComponent }>;

export const deviceTemplateLoaders = {
  "server-default": () =>
    import("./device-templates/ServerDeviceTemplate").then((module) => ({
      default: module.ServerDeviceTemplate,
    })),
  "switch-default": () =>
    import("./device-templates/SwitchDeviceTemplate").then((module) => ({
      default: module.SwitchDeviceTemplate,
    })),
  "router-default": () =>
    import("./device-templates/RouterDeviceTemplate").then((module) => ({
      default: module.RouterDeviceTemplate,
    })),
  "patch-panel-default": () =>
    import("./device-templates/PatchPanelDeviceTemplate").then((module) => ({
      default: module.PatchPanelDeviceTemplate,
    })),
  "pdu-default": () =>
    import("./device-templates/PduDeviceTemplate").then((module) => ({
      default: module.PduDeviceTemplate,
    })),
  "firewall-default": () =>
    import("./device-templates/FirewallDeviceTemplate").then((module) => ({
      default: module.FirewallDeviceTemplate,
    })),
} satisfies Record<DeviceTemplateKey, DeviceTemplateLoader>;
