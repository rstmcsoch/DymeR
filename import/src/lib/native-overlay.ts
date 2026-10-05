import { useFocus } from "@/lib/focus-store"
import { kindLabel } from "@/lib/timer-engine"

export type FocusNative = {
  show: (json: string) => void
  hide: () => void
  update: (json: string) => void
  ensure?: (json: string, ask: boolean) => void
  canDraw: () => boolean
  requestPermission: () => void
  consumePending: () => string
  overlayState?: () => string
}

export function focusNative(): FocusNative | null {
  if (typeof window === "undefined") return null
  return (window as unknown as { FocusNative?: FocusNative }).FocusNative ?? null
}

export function nativeCanDraw(native: FocusNative | null = focusNative()): boolean {
  if (!native) return false
  const value = native.canDraw() as unknown
  return value === true || value === 1 || value === "1" || value === "true"
}

export function overlaySnapshot(layout = false): string {
  const s = useFocus.getState()
  const now = Date.now()
  const left = s.phase === "running" && s.endsAt != null ? Math.max(0, s.endsAt - now) : s.remainingMs
  return JSON.stringify({
    phase: s.phase,
    kind: s.kind,
    left,
    endsAt: s.endsAt,
    label: kindLabel(s.kind),
    widgetOpen: s.widgetOpen,
    opacity: s.settings.opacity ?? 1,
    ...(layout ? { w: s.settings.widgetW, h: s.settings.widgetH } : {}),
  })
}

export function requestNativeOverlay(ask = false) {
  const native = focusNative()
  if (!native || !useFocus.getState().widgetOpen) return
  if (native.ensure) {
    native.ensure(overlaySnapshot(), ask)
    return
  }
  if (!nativeCanDraw(native)) {
    if (ask) native.requestPermission()
    return
  }
  native.show(overlaySnapshot())
}

export function hideNativeOverlay() {
  focusNative()?.hide()
}

export function adoptNativeClock() {
  const raw = focusNative()?.overlayState?.() ?? ""
  if (!raw) return
  try {
    const o = JSON.parse(raw) as { visible?: boolean; phase?: string; left?: number; endsAt?: number | null }
    if (!o.visible) return
    if (o.phase !== "running" && o.phase !== "paused" && o.phase !== "idle") return
    const endsAt = typeof o.endsAt === "number" && o.endsAt > 0 ? o.endsAt : null
    useFocus.setState({
      phase: o.phase,
      remainingMs: Math.max(0, Number(o.left) || 0),
      endsAt: o.phase === "running" ? endsAt : null,
      widgetOpen: true,
    })
  } catch {
    /* ignore malformed native state */
  }
}
