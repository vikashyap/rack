import type { RackTemplateProps } from "@repo/config";

export function RackBaseTemplate({ template, unitHeight, width }: RackTemplateProps) {
  const height = template.heightU * unitHeight;
  const railInset = 28;
  const railWidth = 18;

  return (
    <>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="20"
        fill="rgba(15,23,42,0.55)"
        stroke="rgba(148,163,184,0.35)"
        strokeWidth="2"
      />
      <rect
        x={railInset}
        y="14"
        width={railWidth}
        height={height - 28}
        rx="8"
        fill="rgba(71,85,105,0.55)"
      />
      <rect
        x={width - railInset - railWidth}
        y="14"
        width={railWidth}
        height={height - 28}
        rx="8"
        fill="rgba(71,85,105,0.55)"
      />
      {Array.from({ length: template.heightU }, (_, index) => {
        const y = 18 + index * unitHeight;

        return (
          <g key={index}>
            <line
              x1={railInset + railWidth + 10}
              x2={width - railInset - railWidth - 10}
              y1={y}
              y2={y}
              stroke="rgba(148,163,184,0.20)"
              strokeDasharray="5 7"
            />
            <text
              x={railInset - 8}
              y={y + 10}
              fill="rgba(226,232,240,0.65)"
              fontSize="9"
              fontWeight="700"
              textAnchor="end"
            >
              {template.heightU - index}
            </text>
          </g>
        );
      })}
    </>
  );
}
