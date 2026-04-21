import type { ComponentPropsWithoutRef, ComponentType } from "react";

export type RackTemplateKey = "rack-42u" | "rack-20u";

export type RackTemplateConfig = {
  id: string;
  name: string;
  templateKey: RackTemplateKey;
  heightU: number;
};

export interface RackTemplateProps
  extends Omit<ComponentPropsWithoutRef<"g">, "children"> {
  template: RackTemplateConfig;
  width: number;
  unitHeight: number;
}

export type RackTemplateComponent = ComponentType<RackTemplateProps>;
