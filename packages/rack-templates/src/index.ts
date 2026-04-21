import type { RackTemplateComponent, RackTemplateKey } from "@repo/config";

export type RackTemplateLoader = () => Promise<{ default: RackTemplateComponent }>;

export const rackTemplateLoaders = {
  "rack-42u": () =>
    import("./rack-templates/Rack42Template").then((module) => ({
      default: module.Rack42Template,
    })),
  "rack-20u": () =>
    import("./rack-templates/Rack20Template").then((module) => ({
      default: module.Rack20Template,
    })),
} satisfies Record<RackTemplateKey, RackTemplateLoader>;
