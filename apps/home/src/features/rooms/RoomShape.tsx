import { boundsOf, dist, formatLength, pointInPolygon } from "../../lib/geometry";
import type { Pt } from "../../lib/types";

const PAD = 34;

/** The room on its own, drawn to fit its box, with every wall's length outside it. */
export function RoomShape({ points, paint, height = 220 }: { points: Pt[]; paint?: string; height?: number }) {
  if (points.length < 3) return null;
  const b = boundsOf(points);
  const w = b.maxX - b.minX || 1;
  const h = b.maxY - b.minY || 1;
  // Draw in a fixed 400-wide coordinate system; the SVG scales to its container.
  const W = 400;
  const scale = Math.min((W - PAD * 2) / w, (height - PAD * 2) / h);
  const ox = (W - w * scale) / 2;
  const oy = (height - h * scale) / 2;
  const s = (p: Pt) => ({ x: (p.x - b.minX) * scale + ox, y: (p.y - b.minY) * scale + oy });
  const sp = points.map(s);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="h-auto w-full" role="img" aria-label="Room outline with wall lengths">
      <polygon
        points={sp.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={paint ?? "var(--card)"}
        stroke="var(--plan-wall)"
        strokeWidth={5}
        strokeLinejoin="miter"
      />
      <g textAnchor="middle" fontFamily="var(--font-dim)" fontSize={14} fontWeight={500} fill="var(--ink-2)">
        {points.map((a, i) => {
          const bpt = points[(i + 1) % points.length]!;
          const sa = sp[i]!;
          const sb = sp[(i + 1) % sp.length]!;
          const len = dist(sa, sb);
          if (len < 36) return null;
          let nx = (sb.y - sa.y) / len;
          let ny = -(sb.x - sa.x) / len;
          const probe = { x: (a.x + bpt.x) / 2 + nx, y: (a.y + bpt.y) / 2 + ny };
          if (pointInPolygon(probe, points)) {
            nx = -nx;
            ny = -ny;
          }
          const anchor = nx > 0.5 ? "start" : nx < -0.5 ? "end" : "middle";
          const off = anchor === "middle" ? 16 : 9;
          return (
            <text key={i} x={(sa.x + sb.x) / 2 + nx * off} y={(sa.y + sb.y) / 2 + ny * off + 5} textAnchor={anchor}>
              {formatLength(dist(a, bpt))}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
