import { lazy, Suspense, type ComponentPropsWithoutRef } from "react";

import type { DeviceTemplateProps } from "@repo/config";

import { deviceTemplateLoaders } from "./loaders";

export type {
  DeviceCategory,
  DevicePortConfig,
  DevicePortType,
  DeviceTemplateClassNames,
  DeviceTemplateComponent,
  DeviceTemplateConfig,
  DeviceTemplateKey,
  DeviceTemplateProps,
} from "@repo/config";

export interface DeviceTemplateRootProps extends ComponentPropsWithoutRef<"g"> {}

const lazyDeviceTemplateRegistry = Object.fromEntries(
  Object.entries(deviceTemplateLoaders).map(([templateKey, loader]) => [
    templateKey,
    lazy(loader),
  ]),
) as {
  [TemplateKey in keyof typeof deviceTemplateLoaders]: ReturnType<typeof lazy>;
};

function DeviceTemplateRoot({
  className,
  category,
  children,
  ...props
}: DeviceTemplateRootProps & { category?: string }) {
  return (
    <g className={className} data-category={category} {...props}>
      {children}
    </g>
  );
}

function DeviceTemplateAuto(props: DeviceTemplateProps) {
  const Template = lazyDeviceTemplateRegistry[props.template.templateKey];

  return (
    <Suspense fallback={null}>
      <DeviceTemplateRoot category={props.template.category}>
        <Template {...props} />
      </DeviceTemplateRoot>
    </Suspense>
  );
}

export const DeviceTemplate = Object.assign(DeviceTemplateRoot, {
  Auto: DeviceTemplateAuto,
});
