import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "./lib/cn";

export interface AppShellProps extends ComponentPropsWithoutRef<"main"> {
  children: ReactNode;
  overlayClassName?: string;
}

function AppShellRoot({ className, overlayClassName, children, ...props }: AppShellProps) {
  return (
    <main className={cn("relative h-screen overflow-hidden", className)} {...props}>
      <div className={cn("ui-app-shell absolute inset-0 -z-10", overlayClassName)} />
      {children}
    </main>
  );
}

export const AppShell = AppShellRoot;
