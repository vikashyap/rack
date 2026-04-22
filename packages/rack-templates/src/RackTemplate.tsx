import { lazy, Suspense, type ComponentPropsWithoutRef } from "react";

import type { RackTemplateProps } from "@repo/config";
import { rackTemplateLoaders } from "./loaders";

export type {
  RackTemplateComponent,
  RackTemplateConfig,
  RackTemplateKey,
  RackTemplateProps,
} from "@repo/config";

export interface RackTemplateRootProps extends ComponentPropsWithoutRef<"g"> {}

const lazyRackTemplateRegistry = Object.fromEntries(
  Object.entries(rackTemplateLoaders).map(([templateKey, loader]) => [
    templateKey,
    lazy(loader),
  ]),
) as {
  [TemplateKey in keyof typeof rackTemplateLoaders]: ReturnType<typeof lazy>;
};

function RackTemplateRoot({ children, className, ...props }: RackTemplateRootProps) {
  return (
    <g className={className} {...props}>
      {children}
    </g>
  );
}

function RackTemplateAuto(props: RackTemplateProps) {
  const Template = lazyRackTemplateRegistry[props.template.templateKey];

  return (
    <Suspense fallback={null}>
      <RackTemplateRoot>
        <Template {...props} />
      </RackTemplateRoot>
    </Suspense>
  );
}

export const RackTemplate = Object.assign(RackTemplateRoot, {
  Auto: RackTemplateAuto,
});
