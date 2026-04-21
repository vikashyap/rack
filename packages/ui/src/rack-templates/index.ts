import type { RackTemplateComponent, RackTemplateKey } from "@repo/config";

export type RackTemplateLoader = () => Promise<{ default: RackTemplateComponent }>;

export const rackTemplateLoaders = {
  "rack-42u": () =>
    import("./Rack42Template").then((module) => ({
      default: module.Rack42Template,
    })),
  "rack-20u": () =>
    import("./Rack20Template").then((module) => ({
      default: module.Rack20Template,
    })),
} satisfies Record<RackTemplateKey, RackTemplateLoader>;
