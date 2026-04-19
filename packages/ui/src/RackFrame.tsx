import type { ComponentPropsWithoutRef, ReactNode, SVGProps } from "react";

import { cn } from "./lib/cn";
import { ControlGroup } from "./ControlGroup";

export type RackView = "front" | "back";

export interface RackFrameProps extends ComponentPropsWithoutRef<"div"> { }

export interface RackFrameHeaderProps extends ComponentPropsWithoutRef<"header"> {
  title?: string;
  subtitle?: string;
  badgeColor?: string;
}

export interface RackFrameActionsProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  view: RackView;
  onViewChange: (view: RackView) => void;
}

export interface RackFrameZoomActionsProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
}

export interface RackFrameViewportProps extends ComponentPropsWithoutRef<"section"> { }

export interface RackFrameCanvasProps
  extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> {
  rackHeight: number;
  uHeight: number;
  width: number;
  view: RackView;
  children?: ReactNode;
}

export interface RackFrameBackgroundProps
  extends Omit<ComponentPropsWithoutRef<"rect">, "x" | "y" | "width" | "height"> {
  width: number;
  totalHeight: number;
}

export interface RackFrameRailsProps
  extends Omit<ComponentPropsWithoutRef<"g">, "children"> {
  width: number;
  totalHeight: number;
  railWidth: number;
}

export interface RackFrameMarkersProps
  extends Omit<ComponentPropsWithoutRef<"g">, "children"> {
  rackHeight: number;
  uHeight: number;
  width: number;
  railWidth: number;
  mountHoleRadius: number;
}

export interface RackFrameViewBadgeProps
  extends Omit<ComponentPropsWithoutRef<"g">, "children"> {
  view: RackView;
  width: number;
  railWidth: number;
}

function RackFrameRoot({ className, children, ...props }: RackFrameProps) {
  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      {children}
    </div>
  );
}

function RackFrameHeader({
  className,
  title = "Rack 42U",
  subtitle = "front and back views",
  badgeColor,
  children,
  ...props
}: RackFrameHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-4 z-20 mb-4 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--ui-surface-border)] bg-[color:var(--ui-rack-header-bg)] px-6 py-4 shadow-[var(--ui-surface-shadow)] backdrop-blur",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex items-center gap-3">
            <div
              className={cn("h-2.5 w-2.5 rounded-full", !badgeColor && "bg-cyan-400")}
              style={badgeColor ? { backgroundColor: badgeColor } : undefined}
            />
            <div>
              <div className="text-[length:var(--ui-surface-title-size)] font-semibold text-white">
                {title}
              </div>
              <div className="text-[length:var(--ui-surface-subtitle-size)] text-[color:var(--ui-surface-subtitle-color)]">
                {subtitle}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function RackFrameActions({
  view,
  onViewChange,
  className,
  ...props
}: RackFrameActionsProps) {
  return (
    <ControlGroup className={className} {...props}>
      {(["front", "back"] as RackView[]).map((candidate) => {
        const active = view === candidate;

        return (
          <ControlGroup.Button
            key={candidate}
            active={active}
            onClick={() => onViewChange(candidate)}
            aria-pressed={active}
          >
            {candidate}
          </ControlGroup.Button>
        );
      })}
    </ControlGroup>
  );
}

function RackFrameZoomActions({
  canZoomIn = true,
  canZoomOut = true,
  onZoomIn,
  onZoomOut,
  zoom,
  className,
  ...props
}: RackFrameZoomActionsProps) {
  return (
    <ControlGroup className={className} {...props}>
      <ControlGroup.Button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="h-8 w-8 px-0 py-0 text-sm"
        aria-label="Zoom out"
      >
        -
      </ControlGroup.Button>
      <ControlGroup.Value>
        {Math.round(zoom * 100)}%
      </ControlGroup.Value>
      <ControlGroup.Button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="h-8 w-8 px-0 py-0 text-sm"
        aria-label="Zoom in"
      >
        +
      </ControlGroup.Button>
    </ControlGroup>
  );
}

function RackFrameViewport({
  className,
  children,
  ...props
}: RackFrameViewportProps) {
  return (
    <section
      className={cn(
        "min-h-0 flex-1 overflow-hidden rounded-2xl border border-[color:var(--ui-rack-viewport-border)] bg-[color:var(--ui-rack-viewport-bg)] shadow-[var(--ui-rack-viewport-shadow)] backdrop-blur",
        className,
      )}
      {...props}
    >
      <div className="h-full overflow-auto scroll-smooth custom-scrollbar">
        {children}
      </div>
    </section>
  );
}

function RackFrameCanvas({
  rackHeight,
  uHeight,
  width,
  view,
  className,
  children,
  ...props
}: RackFrameCanvasProps) {
  const totalHeight = rackHeight * uHeight;
  const railWidth = 40;
  const mountHoleRadius = 3;

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`Rack frame ${view} view`}
      {...props}
    >
      {children ?? (
        <>
          <RackFrameBackground width={width} totalHeight={totalHeight} />
          <RackFrameRails
            width={width}
            totalHeight={totalHeight}
            railWidth={railWidth}
          />
          <RackFrameMarkers
            rackHeight={rackHeight}
            uHeight={uHeight}
            width={width}
            railWidth={railWidth}
            mountHoleRadius={mountHoleRadius}
          />
          <RackFrameViewBadge
            view={view}
            width={width}
            railWidth={railWidth}
          />
        </>
      )}
    </svg>
  );
}

function RackFrameBackground({
  width,
  totalHeight,
  className,
  ...props
}: RackFrameBackgroundProps) {
  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={totalHeight}
      className={cn("fill-[color:var(--ui-rack-bg)]", className)}
      {...props}
    />
  );
}

function RackFrameRails({
  width,
  totalHeight,
  railWidth,
  className,
  ...props
}: RackFrameRailsProps) {
  return (
    <g className={className} {...props}>
      <rect
        x={0}
        y={0}
        width={railWidth}
        height={totalHeight}
        className="fill-[color:var(--ui-rack-rail-base)]"
      />
      <rect
        x={0}
        y={0}
        width={railWidth}
        height={totalHeight}
        className="fill-[color:var(--ui-rack-rail-overlay)]"
      />
      <rect
        x={width - railWidth}
        y={0}
        width={railWidth}
        height={totalHeight}
        className="fill-[color:var(--ui-rack-rail-base)]"
      />
      <rect
        x={width - railWidth}
        y={0}
        width={railWidth}
        height={totalHeight}
        className="fill-[color:var(--ui-rack-rail-overlay)]"
      />
    </g>
  );
}

function RackFrameMarkers({
  rackHeight,
  uHeight,
  width,
  railWidth,
  mountHoleRadius,
  className,
  ...props
}: RackFrameMarkersProps) {
  return (
    <g className={className} {...props}>
      {Array.from({ length: rackHeight }, (_, i) => {
        const uNumber = rackHeight - i;
        const y = i * uHeight;

        return (
          <g key={uNumber}>
            <line
              x1={railWidth}
              y1={y}
              x2={width - railWidth}
              y2={y}
              className="stroke-[color:var(--ui-rack-divider)]"
              strokeDasharray="4 4"
            />
            <text
              x={railWidth / 2}
              y={y + uHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[color:var(--ui-rack-label)] font-mono text-[11px] tracking-[0.2em]"
            >
              {uNumber}
            </text>
            <circle
              cx={railWidth - 10}
              cy={y + uHeight / 3}
              r={mountHoleRadius}
              className="fill-[color:var(--ui-rack-bg)] stroke-[color:var(--ui-rack-hole)]"
            />
            <circle
              cx={railWidth - 10}
              cy={y + (2 * uHeight) / 3}
              r={mountHoleRadius}
              className="fill-[color:var(--ui-rack-bg)] stroke-[color:var(--ui-rack-hole)]"
            />
            <circle
              cx={width - railWidth + 10}
              cy={y + uHeight / 3}
              r={mountHoleRadius}
              className="fill-[color:var(--ui-rack-bg)] stroke-[color:var(--ui-rack-hole)]"
            />
            <circle
              cx={width - railWidth + 10}
              cy={y + (2 * uHeight) / 3}
              r={mountHoleRadius}
              className="fill-[color:var(--ui-rack-bg)] stroke-[color:var(--ui-rack-hole)]"
            />
          </g>
        );
      })}
    </g>
  );
}

function RackFrameViewBadge({
  view,
  width,
  railWidth,
  className,
  ...props
}: RackFrameViewBadgeProps) {
  return (
    <g
      transform={`translate(${width - railWidth - 54}, 14)`}
      className={className}
      {...props}
    >
      <rect
        width={44}
        height={18}
        rx={9}
        className="fill-[color:var(--ui-rack-badge-bg)] stroke-[color:var(--ui-rack-badge-border)]"
      />
      <text
        x={22}
        y={12.5}
        textAnchor="middle"
        className="fill-[color:var(--ui-device-label)] font-mono text-[11px] tracking-[0.2em] font-bold"
      >
        {view}
      </text>
    </g>
  );
}

export const RackFrame = Object.assign(RackFrameRoot, {
  Actions: RackFrameActions,
  Background: RackFrameBackground,
  Canvas: RackFrameCanvas,
  Header: RackFrameHeader,
  Markers: RackFrameMarkers,
  Rails: RackFrameRails,
  ViewBadge: RackFrameViewBadge,
  Viewport: RackFrameViewport,
  ZoomActions: RackFrameZoomActions,
});
