import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Button, Icon, IconButton } from "../../components/ui";
import {
  centroid,
  dist,
  formatArea,
  formatLength,
  pointInPolygon,
  polygonAreaCm2,
  snapOrthogonal,
  snapToGrid,
} from "../../lib/geometry";
import type { Floor, Pt, Room } from "../../lib/types";

export type PlanMode = "view" | "draw" | "measure" | "edit";

/** screen = world × k + t, with world in centimetres and screen in CSS pixels. */
interface View {
  k: number;
  tx: number;
  ty: number;
}

const EMPTY_PLAN = { w: 1200, h: 900 };
const CLOSE_RADIUS_PX = 24;
const TAP_SLOP_PX = 6;
const DEFAULT_FILL = "var(--card)";

function worldAt(v: View, screen: Pt): Pt {
  return { x: (screen.x - v.tx) / v.k, y: (screen.y - v.ty) / v.k };
}

type Gesture =
  | { type: "none" }
  | { type: "pan"; start: Pt; view: View; moved: boolean }
  | { type: "pinch"; d0: number; mid0: Pt; view: View }
  | { type: "vertex"; roomId: string; index: number };

export function PlanCanvas({
  floor,
  rooms,
  imageUrl,
  imageOpacity,
  mode,
  selectedRoomId,
  onSelectRoom,
  onFinishRoom,
  onMeasured,
  onMoveVertex,
  onCancelMode,
}: {
  floor: Floor;
  rooms: Room[];
  imageUrl?: string;
  imageOpacity: number;
  mode: PlanMode;
  selectedRoomId?: string;
  onSelectRoom: (id: string | undefined) => void;
  onFinishRoom: (points: Pt[]) => void;
  onMeasured: (drawnCm: number) => void;
  onMoveVertex: (roomId: string, index: number, p: Pt) => void;
  onCancelMode: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<View | null>(null);
  // Points belong to the mode they were placed in, so switching modes discards them.
  const [draft, setDraft] = useState<{ mode: PlanMode; points: Pt[] }>({ mode, points: [] });
  const [hover, setHover] = useState<Pt | null>(null);
  const [dragPt, setDragPt] = useState<{ roomId: string; index: number; p: Pt } | null>(null);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<Gesture>({ type: "none" });

  const points = draft.mode === mode ? draft.points : [];
  const hasImage = Boolean(floor.planImageId && floor.planImageWidth && floor.planImageHeight);
  const world = hasImage
    ? { w: floor.planImageWidth! * floor.cmPerPx, h: floor.planImageHeight! * floor.cmPerPx }
    : EMPTY_PLAN;

  function fit(s: { w: number; h: number }): View {
    const k = Math.min(s.w / world.w, s.h / world.h) * 0.9;
    return { k, tx: (s.w - world.w * k) / 2, ty: (s.h - world.h * k) / 2 };
  }

  useEffect(() => {
    const el = boxRef.current!;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry!.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The first size we learn about fits the plan to the box.
  const v: View | null = view ?? (size ? fit(size) : null);

  const toWorld = (p: Pt): Pt => worldAt(v!, p);
  const toScreen = (p: Pt): Pt => ({ x: p.x * v!.k + v!.tx, y: p.y * v!.k + v!.ty });
  const local = (e: { clientX: number; clientY: number }): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function zoomAt(screen: Pt, factor: number) {
    if (!v) return;
    const k = Math.min(Math.max(v.k * factor, 0.02), 20);
    const w = toWorld(screen);
    setView({ k, tx: screen.x - w.x * k, ty: screen.y - w.y * k });
  }

  // Wheel and trackpad zoom. React's onWheel is passive, so it can't stop the page scrolling.
  const zoomRef = useRef(zoomAt);
  useEffect(() => {
    zoomRef.current = zoomAt;
  });
  useEffect(() => {
    const svg = svgRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      zoomRef.current({ x: e.clientX - r.left, y: e.clientY - r.top }, Math.exp(-e.deltaY * 0.0015));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  function snap(p: Pt, prev?: Pt): Pt {
    let q = hasImage ? p : snapToGrid(p, 5);
    if (prev) q = snapOrthogonal(prev, q);
    return q;
  }

  function onTap(screen: Pt) {
    const w = toWorld(screen);
    if (mode === "draw") {
      const first = points[0];
      if (first && points.length >= 3 && dist(toScreen(first), screen) < CLOSE_RADIUS_PX) {
        onFinishRoom(points);
        setDraft({ mode, points: [] });
        return;
      }
      setDraft({ mode, points: [...points, snap(w, points[points.length - 1])] });
      return;
    }
    if (mode === "measure") {
      // A third tap starts a new measurement.
      const next = points.length >= 2 ? [w] : [...points, w];
      setDraft({ mode, points: next });
      if (next.length === 2) onMeasured(dist(next[0]!, next[1]!));
      return;
    }
    // View and edit: tapping selects the room under the finger, topmost first.
    const hit = [...rooms].reverse().find((r) => pointInPolygon(w, r.points));
    onSelectRoom(hit?.id);
  }

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (!v) return;
    svgRef.current!.setPointerCapture(e.pointerId);
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [Pt, Pt];
      gesture.current = { type: "pinch", d0: dist(a, b), mid0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, view: v };
      return;
    }
    const handle = (e.target as Element).closest("[data-vertex]");
    if (handle && mode === "edit") {
      const [roomId, index] = handle.getAttribute("data-vertex")!.split(":");
      gesture.current = { type: "vertex", roomId: roomId!, index: Number(index) };
      return;
    }
    gesture.current = { type: "pan", start: p, view: v, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const p = local(e);
    if (e.pointerType === "mouse" && v) setHover(toWorld(p));
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (g.type === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [Pt, Pt];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const k = Math.min(Math.max(g.view.k * (dist(a, b) / g.d0), 0.02), 20);
      const w = worldAt(g.view, g.mid0);
      setView({ k, tx: mid.x - w.x * k, ty: mid.y - w.y * k });
    } else if (g.type === "pan") {
      if (!g.moved && dist(g.start, p) > TAP_SLOP_PX) g.moved = true;
      if (g.moved) setView({ ...g.view, tx: g.view.tx + p.x - g.start.x, ty: g.view.ty + p.y - g.start.y });
    } else if (g.type === "vertex" && v) {
      const room = rooms.find((r) => r.id === g.roomId);
      const n = room?.points.length ?? 0;
      const prev = room?.points[(g.index - 1 + n) % n];
      setDragPt({ roomId: g.roomId, index: g.index, p: snap(toWorld(p), prev) });
    }
  }

  function onPointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g.type === "pan" && !g.moved) onTap(local(e));
    if (g.type === "vertex" && dragPt) {
      onMoveVertex(dragPt.roomId, dragPt.index, dragPt.p);
      setDragPt(null);
    }
    // Whatever was happening is over; lifting one finger of a pinch must not become a pan or a tap.
    gesture.current = { type: "none" };
  }

  const shown = useMemo(
    () =>
      rooms.map((r) =>
        dragPt && dragPt.roomId === r.id
          ? { ...r, points: r.points.map((p, i) => (i === dragPt.index ? dragPt.p : p)) }
          : r,
      ),
    [rooms, dragPt],
  );

  const gridStep = v && v.k * 100 < 18 ? 500 : 100;

  return (
    <div ref={boxRef} className="relative h-full w-full overflow-hidden bg-paper-2">
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        style={{ cursor: mode === "draw" || mode === "measure" ? "crosshair" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
        role="application"
        aria-label={`Floor plan of ${floor.name}`}
      >
        {v && (
          <>
            <defs>
              <pattern
                id="grid"
                width={gridStep * v.k}
                height={gridStep * v.k}
                patternUnits="userSpaceOnUse"
                x={v.tx}
                y={v.ty}
              >
                <path
                  d={`M ${gridStep * v.k} 0 L 0 0 0 ${gridStep * v.k}`}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth={1}
                  opacity={0.6}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${v.tx} ${v.ty}) scale(${v.k})`}>
              {hasImage && imageUrl && imageOpacity > 0 && (
                <image href={imageUrl} width={world.w} height={world.h} opacity={imageOpacity} preserveAspectRatio="none" />
              )}
              {shown.map((r) => (
                <polygon
                  key={r.id}
                  points={r.points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill={r.paint ?? DEFAULT_FILL}
                  fillOpacity={hasImage && imageOpacity > 0 ? 0.72 : 1}
                  stroke={r.id === selectedRoomId ? "var(--cobalt)" : "var(--plan-wall)"}
                  strokeWidth={r.id === selectedRoomId ? 3.5 : 2.5}
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>

            {/* Labels and handles are drawn in screen space so they keep their size when zooming. */}
            {shown.map((r) => (
              <RoomLabel key={r.id} room={r} k={v.k} toScreen={toScreen} selected={r.id === selectedRoomId} />
            ))}
            {selectedRoomId &&
              shown
                .filter((r) => r.id === selectedRoomId)
                .map((r) => <EdgeLengths key={r.id} points={r.points} toScreen={toScreen} closed />)}
            {mode === "edit" &&
              shown
                .filter((r) => r.id === selectedRoomId)
                .flatMap((r) =>
                  r.points.map((p, i) => {
                    const s = toScreen(p);
                    return (
                      <circle
                        key={`${r.id}:${i}`}
                        data-vertex={`${r.id}:${i}`}
                        cx={s.x}
                        cy={s.y}
                        r={11}
                        fill="var(--card)"
                        stroke="var(--cobalt)"
                        strokeWidth={3}
                        style={{ cursor: "move" }}
                      />
                    );
                  }),
                )}

            {mode === "draw" && <Draft points={points} hover={hover ? snap(hover, points.at(-1)) : null} toScreen={toScreen} />}
            {mode === "measure" && <Measure points={points} hover={points.length === 1 ? hover : null} toScreen={toScreen} />}
          </>
        )}
      </svg>

      <div className="absolute top-3 right-3 flex flex-col gap-1 rounded-2xl bg-card shadow-[0_0_0_1px_var(--line)]">
        <IconButton label="Zoom in" onClick={() => size && zoomAt({ x: size.w / 2, y: size.h / 2 }, 1.4)}>
          <Icon name="plus" size={20} />
        </IconButton>
        <IconButton label="Zoom out" onClick={() => size && zoomAt({ x: size.w / 2, y: size.h / 2 }, 1 / 1.4)}>
          <span className="text-xl leading-none">−</span>
        </IconButton>
        <IconButton label="Fit plan to screen" onClick={() => size && setView(fit(size))}>
          <Icon name="shape" size={20} />
        </IconButton>
      </div>

      {mode === "draw" && (
        <ModeBar
          text={
            points.length === 0
              ? "Tap each corner of the room in turn."
              : points.length < 3
                ? "Keep tapping corners."
                : "Tap the first corner, or Finish, to close the room."
          }
        >
          <IconButton
            label="Undo last corner"
            disabled={points.length === 0}
            onClick={() => setDraft({ mode, points: points.slice(0, -1) })}
          >
            <Icon name="undo" size={20} />
          </IconButton>
          <Button variant="quiet" onClick={onCancelMode}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={points.length < 3}
            onClick={() => {
              onFinishRoom(points);
              setDraft({ mode, points: [] });
            }}
          >
            Finish
          </Button>
        </ModeBar>
      )}
      {mode === "measure" && (
        <ModeBar text="Tap both ends of a wall whose length you know, like one written on the plan.">
          <Button variant="quiet" onClick={onCancelMode}>
            Cancel
          </Button>
        </ModeBar>
      )}
      {mode === "edit" && (
        <ModeBar text="Drag the corners to fit the walls.">
          <Button variant="primary" onClick={onCancelMode}>
            Done
          </Button>
        </ModeBar>
      )}
    </div>
  );
}

function ModeBar({ text, children }: { text: string; children: ReactNode }) {
  return (
    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-2xl bg-card p-2 pl-4 shadow-[0_6px_24px_rgb(0_0_0/0.16)] sm:right-auto sm:max-w-xl">
      <p className="flex-1 text-[15px] leading-snug">{text}</p>
      {children}
    </div>
  );
}

const halo = { paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 4, strokeLinejoin: "round" } as const;

function RoomLabel({
  room,
  k,
  toScreen,
  selected,
}: {
  room: Room;
  k: number;
  toScreen: (p: Pt) => Pt;
  selected: boolean;
}) {
  if (room.points.length < 3) return null;
  const c = toScreen(centroid(room.points));
  const screenArea = polygonAreaCm2(room.points) * k * k;
  if (screenArea < 1600 && !selected) return null;
  return (
    <g pointerEvents="none" textAnchor="middle">
      <text x={c.x} y={c.y - 2} fontSize={15} fontWeight={600} fill="var(--ink)" style={halo}>
        {room.name}
      </text>
      {screenArea > 4000 && (
        <text x={c.x} y={c.y + 16} fontSize={14} fill="var(--ink-2)" fontFamily="var(--font-dim)" style={halo}>
          {formatArea(room.points)}
        </text>
      )}
    </g>
  );
}

function EdgeLengths({ points, toScreen, closed }: { points: Pt[]; toScreen: (p: Pt) => Pt; closed?: boolean }) {
  const edges = closed ? points.length : points.length - 1;
  return (
    <g pointerEvents="none" textAnchor="middle" fontFamily="var(--font-dim)" fontSize={13} fontWeight={500}>
      {Array.from({ length: Math.max(0, edges) }, (_, i) => {
        const a = points[i]!;
        const b = points[(i + 1) % points.length]!;
        const sa = toScreen(a);
        const sb = toScreen(b);
        const len = dist(sa, sb);
        if (len < 48) return null;
        // Put the label on the outside of the wall.
        let nx = (sb.y - sa.y) / len;
        let ny = -(sb.x - sa.x) / len;
        const mid = { x: (sa.x + sb.x) / 2, y: (sa.y + sb.y) / 2 };
        if (closed) {
          const probe = { x: (a.x + b.x) / 2 + nx, y: (a.y + b.y) / 2 + ny };
          if (pointInPolygon(probe, points)) {
            nx = -nx;
            ny = -ny;
          }
        }
        // Labels beside upright walls grow away from the wall instead of straddling it.
        const anchor = nx > 0.5 ? "start" : nx < -0.5 ? "end" : "middle";
        const off = anchor === "middle" ? 14 : 8;
        return (
          <text
            key={i}
            x={mid.x + nx * off}
            y={mid.y + ny * off + 4}
            textAnchor={anchor}
            fill="var(--cobalt)"
            style={halo}
          >
            {formatLength(dist(a, b))}
          </text>
        );
      })}
    </g>
  );
}

function Draft({ points, hover, toScreen }: { points: Pt[]; hover: Pt | null; toScreen: (p: Pt) => Pt }) {
  const all = hover ? [...points, hover] : points;
  const s = all.map(toScreen);
  return (
    <g pointerEvents="none">
      <polyline
        points={s.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="var(--cobalt)"
        strokeWidth={2.5}
      />
      {s.slice(0, points.length).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === 0 && points.length >= 3 ? 12 : 6} fill="var(--card)" stroke="var(--cobalt)" strokeWidth={2.5} />
      ))}
      <EdgeLengths points={all} toScreen={toScreen} />
    </g>
  );
}

function Measure({ points, hover, toScreen }: { points: Pt[]; hover: Pt | null; toScreen: (p: Pt) => Pt }) {
  const all = hover ? [...points, hover] : points;
  const s = all.map(toScreen);
  return (
    <g pointerEvents="none">
      {s.length === 2 && <line x1={s[0]!.x} y1={s[0]!.y} x2={s[1]!.x} y2={s[1]!.y} stroke="var(--cobalt)" strokeWidth={2.5} />}
      {s.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={6} fill="var(--card)" stroke="var(--cobalt)" strokeWidth={2.5} />
      ))}
      {all.length === 2 && <EdgeLengths points={all} toScreen={toScreen} />}
    </g>
  );
}
