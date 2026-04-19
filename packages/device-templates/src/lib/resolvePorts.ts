import type {
  DeviceCategory,
  DevicePortConfig,
  DevicePortType,
  DeviceTemplateConfig,
} from "@repo/config";

type LegacyDeviceTemplate = DeviceTemplateConfig & {
  portCount?: number;
};

const defaultPortTypeByCategory: Record<DeviceCategory, DevicePortType> = {
  server: "ethernet",
  switch: "ethernet",
  router: "ethernet",
  "patch-panel": "ethernet",
  pdu: "power",
  firewall: "ethernet",
};

export function resolveTemplatePorts(template: DeviceTemplateConfig): DevicePortConfig[] {
  if (template.ports?.length) {
    return template.ports;
  }

  const legacyTemplate = template as LegacyDeviceTemplate;
  const portCount = legacyTemplate.portCount ?? 0;
  const portType = defaultPortTypeByCategory[template.category];

  return Array.from({ length: portCount }, (_, index) => ({
    id: `${template.templateKey}-${index + 1}`,
    type: portType,
  }));
}
