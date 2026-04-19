import type { ComponentPropsWithoutRef, ComponentType } from "react";

export type DeviceCategory =
  | "server"
  | "switch"
  | "router"
  | "patch-panel"
  | "pdu"
  | "firewall";

export type DevicePortType = "ethernet" | "fiber" | "console" | "power";

export type DevicePortConfig = {
  id: string;
  type: DevicePortType;
};

export type DeviceTemplateKey =
  | "server-default"
  | "switch-default"
  | "router-default"
  | "patch-panel-default"
  | "pdu-default"
  | "firewall-default";

export type DeviceTemplateClassNames = {
  body: string;
  highlight: string;
  label: string;
  accent: string;
  portShell: string;
};

export type DeviceTemplateConfig = {
  id: string;
  name: string;
  category: DeviceCategory;
  templateKey: DeviceTemplateKey;
  uHeight: number;
  ports: DevicePortConfig[];
};

export interface DeviceTemplateProps extends Omit<ComponentPropsWithoutRef<"g">, "children"> {
  template: DeviceTemplateConfig;
  width: number;
  uHeight: number;
  density?: "compact" | "rack";
  label?: string;
  classNames?: Partial<DeviceTemplateClassNames>;
}

export type DeviceTemplateComponent = ComponentType<DeviceTemplateProps>;
