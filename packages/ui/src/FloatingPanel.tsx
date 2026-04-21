import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { Panel } from "./Panel";
import { cn } from "./lib/cn";

export interface FloatingPanelProps extends ComponentPropsWithoutRef<"div"> {
  open: boolean;
  onClose: () => void;
  heading?: ReactNode;
  subheading?: ReactNode;
  children: ReactNode;
}

export function FloatingPanel({
  children,
  className,
  subheading,
  heading,
  onClose,
  open,
  ...props
}: FloatingPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div ref={ref} className={cn("pointer-events-auto", className)} {...props}>
      <Panel className="overflow-hidden">
        {(heading || subheading) && (
          <Panel.Header>
            <div>
              {heading ? <Panel.Title>{heading}</Panel.Title> : null}
              {subheading ? <Panel.Description>{subheading}</Panel.Description> : null}
            </div>
          </Panel.Header>
        )}
        <Panel.Body>{children}</Panel.Body>
      </Panel>
    </div>
  );
}
