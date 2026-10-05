import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { Pause, Play, X } from "lucide-react"
import { useNow } from "@/components/focus/clock"
import { useFocus } from "@/lib/focus-store"
import { focusNative } from "@/lib/native-overlay"
import { formatClock, kindLabel } from "@/lib/timer-engine"

type Box = { x: number; y: number; w: number; h: number }
type Drag =
  | { id: number; mode: "move"; dx: number; dy: number }
  | { id: number; mode: "resize"; originX: number; originY: number; startW: number; startH: number; startX: number; startY: number }

const MIN_W = 168
const MAX_W = 460
const MIN_H = 96
const MAX_H = 420

function clamp(x: number, y: number, w: number, h: number, vw: number, vh: number) {
  const m = 8
  return {
    x: Math.min(Math.max(m, x), Math.max(m, vw - w - m)),
    y: Math.min(Math.max(m, y), Math.max(m, vh - h - m)),
  }
}

function place(width: number, height: number, x: number, y: number, remember: boolean): Box {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (remember && x >= 0 && y >= 0) return { ...clamp(x, y, width, height, vw, vh), w: width, h: height }
  return { ...clamp(vw - width - 12, 16, width, height, vw, vh), w: width, h: height }
}

export function FloatingWidget() {
  const open = useFocus((s) => s.widgetOpen)
  if (!open) return null
  if (typeof window !== "undefined" && focusNative()) return null
  return <WidgetBody />
}

function WidgetBody() {
  const now = useNow()
  const kind = useFocus((s) => s.kind)
  const phase = useFocus((s) => s.phase)
  const plannedMs = useFocus((s) => s.plannedMs)
  const remainingMs = useFocus((s) => s.remainingMs)
  const endsAt = useFocus((s) => s.endsAt)
  const settings = useFocus((s) => s.settings)
  const toggleRun = useFocus((s) => s.toggleRun)
  const closeWidget = useFocus((s) => s.closeWidget)
  const commitWidget = useFocus((s) => s.commitWidget)

  const [box, setBox] = useState<Box>(() =>
    place(settings.widgetW, settings.widgetH, settings.widgetX, settings.widgetY, settings.rememberPlace),
  )
  const drag = useRef<Drag | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const boxRef = useRef(box)
  boxRef.current = box
  const frame = useRef(0)

  useEffect(() => {
    if (drag.current) return
    setBox((cur) => {
      const next = place(settings.widgetW, settings.widgetH, cur.x, cur.y, true)
      return settings.widgetX < 0 ? place(settings.widgetW, settings.widgetH, -1, -1, false) : { ...next, x: cur.x, y: cur.y }
    })
  }, [settings.widgetW, settings.widgetH, settings.widgetX])

  useEffect(() => {
    const onResize = () => {
      const cur = boxRef.current
      const c = clamp(cur.x, cur.y, cur.w, cur.h, window.innerWidth, window.innerHeight)
      setBox({ ...cur, ...c })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const left = phase === "running" && endsAt != null ? Math.max(0, endsAt - now) : remainingMs
  const progress = plannedMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - left / plannedMs))
  const primary = phase === "running" ? "Pause" : phase === "paused" ? "Resume" : "Start"
  const Icon = phase === "running" ? Pause : Play

  function paint(next: Box) {
    boxRef.current = next
    const el = ref.current
    if (!el) return
    el.style.left = `${next.x}px`
    el.style.top = `${next.y}px`
    el.style.width = `${next.w}px`
    el.style.height = `${next.h}px`
  }

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if ((e.target as HTMLElement).closest("[data-nodrag]")) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, mode: "move", dx: e.clientX - boxRef.current.x, dy: e.clientY - boxRef.current.y }
  }

  function onResizeDown(e: ReactPointerEvent<HTMLButtonElement>) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const cur = boxRef.current
    drag.current = {
      id: e.pointerId,
      mode: "resize",
      originX: e.clientX,
      originY: e.clientY,
      startW: cur.w,
      startH: cur.h,
      startX: cur.x,
      startY: cur.y,
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    if (frame.current) return
    const point = { x: e.clientX, y: e.clientY }
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0
      const current = drag.current
      if (!current) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (current.mode === "move") {
        const c = clamp(point.x - current.dx, point.y - current.dy, boxRef.current.w, boxRef.current.h, vw, vh)
        paint({ ...c, w: boxRef.current.w, h: boxRef.current.h })
      } else {
        const w = Math.min(MAX_W, Math.max(MIN_W, Math.round(current.startW + (point.x - current.originX))))
        const h = Math.min(MAX_H, Math.max(MIN_H, Math.round(current.startH + (point.y - current.originY))))
        const c = clamp(current.startX, current.startY, w, h, vw, vh)
        paint({ ...c, w, h })
      }
    })
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    if (!drag.current || drag.current.id !== e.pointerId) return
    drag.current = null
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = 0
    setBox(boxRef.current)
    commitWidget(boxRef.current)
  }

  return (
    <div
      ref={ref}
      className="float-card fixed z-40 touch-none select-none"
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        ["--widget-alpha" as string]: String(settings.opacity ?? 1),
      }}
      data-testid="widget"
      role="region"
      aria-label="Floating focus timer"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="h-1 overflow-hidden bg-chip" aria-hidden="true">
        <div className="h-full bg-brand" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-3 pt-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[0.7rem] font-semibold tracking-widest text-muted uppercase">{kindLabel(kind)}</p>
          <button type="button" className="icon-btn size-9" data-nodrag aria-label="Close floating widget" onClick={closeWidget}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="float-time clock" aria-hidden="true">
          {formatClock(left)}
        </p>
        <button
          type="button"
          className="icon-btn size-11 bg-brand text-on-brand border-0"
          data-nodrag
          aria-label={primary}
          onClick={toggleRun}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        data-nodrag
        aria-label="Resize floating timer"
        className="absolute right-0 bottom-0 grid size-11 cursor-nwse-resize place-items-center text-muted"
        onPointerDown={onResizeDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="block size-3 rounded-sm border-r-2 border-b-2 border-current" />
      </button>
    </div>
  )
}
