import { create } from "zustand"
import { persist } from "zustand/middleware"
import { applyTheme, requestNotify, signalDone, unlockAudio } from "@/lib/feedback"
import {
  advance,
  armFocusMinutes,
  beginRun,
  chooseKind,
  completionCopy,
  createEngine,
  nearestSize,
  pauseRun,
  restartRun,
  sanitize,
  setKindMinutes,
  skipRun,
  toEngine,
  widgetHeightClamp,
  widgetWidthClamp,
  WIDGET_HEIGHT,
  WIDGET_WIDTH,
  type AdvanceResult,
  type Engine,
  type Kind,
  type ThemeMode,
  type WidgetSize,
} from "@/lib/timer-engine"

type FocusState = Engine & {
  hydrated: boolean
  banner: string | null
  reconcile: () => void
  tick: (now?: number) => void
  toggleRun: () => void
  restart: () => void
  skip: () => void
  choose: (kind: Kind) => void
  setMinutes: (kind: Kind, minutes: number) => void
  armAndStart: (minutes: number) => void
  setTheme: (theme: ThemeMode) => void
  setFlag: (key: "autoStart" | "sound" | "vibrate" | "rememberPlace", value: boolean) => void
  setNotify: (on: boolean) => Promise<void>
  setWidgetSize: (size: WidgetSize) => void
  setOpacity: (opacity: number) => void
  commitWidget: (box: { x: number; y: number; w: number; h?: number }) => void
  resetWidgetPlace: () => void
  openWidget: (run: boolean) => void
  closeWidget: () => void
  finishOnboarding: () => void
}

let bannerTimer = 0

function clearBannerLater() {
  if (typeof window === "undefined") return
  window.clearTimeout(bannerTimer)
  bannerTimer = window.setTimeout(() => {
    useFocus.setState({ banner: null })
  }, 4800)
}

function applyResult(result: AdvanceResult, now: number) {
  const copy = result.finishedKinds.length
    ? completionCopy(result.finishedKinds, result.engine)
    : null
  useFocus.setState({
    ...result.engine,
    hydrated: true,
    banner: copy?.body ?? null,
  })
  if (!copy) return
  const audible = result.lastEndedAt != null && now - result.lastEndedAt < 12_000
  signalDone({
    sound: result.engine.settings.sound,
    vibrate: result.engine.settings.vibrate,
    notify: result.engine.settings.notify,
    audible,
    title: copy.title,
    body: copy.body,
  })
  clearBannerLater()
}

function nativeClockPatch(): { phase: "idle" | "running" | "paused"; remainingMs: number; endsAt: number | null } | null {
  if (typeof window === "undefined") return null
  const native = (window as unknown as { FocusNative?: { overlayState?: () => string } }).FocusNative
  if (!native?.overlayState) return null
  let raw = ""
  try {
    raw = native.overlayState()
  } catch {
    return null
  }
  if (!raw) return null
  try {
    const o = JSON.parse(raw) as { visible?: boolean; phase?: string; left?: number; endsAt?: number | null }
    if (!o.visible) return null
    if (o.phase !== "running" && o.phase !== "paused" && o.phase !== "idle") return null
    const endsAt = typeof o.endsAt === "number" && o.endsAt > 0 ? o.endsAt : null
    return {
      phase: o.phase,
      remainingMs: Math.max(0, Number(o.left) || 0),
      endsAt: o.phase === "running" ? endsAt : null,
    }
  } catch {
    return null
  }
}

export const useFocus = create<FocusState>()(
  persist(
    (set, get) => ({
      ...createEngine(0),
      hydrated: false,
      banner: null,
      reconcile: () => {
        const now = Date.now()
        applyResult(advance(sanitize(get(), now), now), now)
        applyTheme(useFocus.getState().settings.theme)
      },
      tick: (now = Date.now()) => {
        const cur = sanitize(get(), now)
        const result = advance(cur, now)
        const changed =
          result.finishedKinds.length > 0 ||
          result.engine.todayKey !== cur.todayKey ||
          result.engine.phase !== cur.phase ||
          result.engine.kind !== cur.kind
        if (!changed) return
        applyResult(result, now)
      },
      toggleRun: () => {
        unlockAudio()
        const now = Date.now()
        const cur = sanitize(get(), now)
        const looked = advance(cur, now)
        if (looked.finishedKinds.length > 0) {
          applyResult(looked, now)
          return
        }
        const next =
          looked.engine.phase === "running" ? pauseRun(looked.engine, now) : beginRun(looked.engine, now)
        set({ ...next, banner: null })
      },
      restart: () => {
        const now = Date.now()
        const cur = sanitize(get(), now)
        set({ ...restartRun(cur, now), banner: null })
      },
      skip: () => {
        const now = Date.now()
        const cur = sanitize(get(), now)
        const looked = advance(cur, now)
        if (looked.finishedKinds.length > 0) {
          applyResult(looked, now)
          return
        }
        set({ ...skipRun(looked.engine, now), banner: null })
      },
      choose: (kind) => {
        const now = Date.now()
        set({ ...chooseKind(sanitize(get(), now), kind, now) })
      },
      setMinutes: (kind, minutes) => {
        const now = Date.now()
        set({ ...setKindMinutes(sanitize(get(), now), kind, minutes, now) })
      },
      armAndStart: (minutes) => {
        unlockAudio()
        const now = Date.now()
        let cur = sanitize(get(), now)
        if (cur.phase !== "idle") {
          set({ widgetOpen: true })
          return
        }
        cur = beginRun(armFocusMinutes(cur, minutes, now), now)
        set({ ...cur, widgetOpen: true, banner: null })
      },
      setTheme: (theme) => {
        set((s) => ({ settings: { ...s.settings, theme } }))
        applyTheme(theme)
      },
      setFlag: (key, value) => {
        set((s) => ({ settings: { ...s.settings, [key]: value } }))
      },
      setNotify: async (on) => {
        const ok = on ? await requestNotify() : false
        set((s) => ({ settings: { ...s.settings, notify: ok } }))
      },
      setWidgetSize: (size) => {
        set((s) => ({
          settings: {
            ...s.settings,
            widgetSize: size,
            widgetW: WIDGET_WIDTH[size],
            widgetH: WIDGET_HEIGHT[size],
          },
        }))
      },
      setOpacity: (opacity) => {
        const n = Math.min(1, Math.max(0.4, Math.round(opacity * 100) / 100))
        set((s) => ({ settings: { ...s.settings, opacity: n } }))
      },
      commitWidget: (box) => {
        const w = widgetWidthClamp(box.w)
        const h = widgetHeightClamp(box.h ?? get().settings.widgetH)
        set((s) => ({
          settings: {
            ...s.settings,
            widgetW: w,
            widgetH: h,
            widgetSize: nearestSize(w),
            widgetX: s.settings.rememberPlace ? Math.round(box.x) : s.settings.widgetX,
            widgetY: s.settings.rememberPlace ? Math.round(box.y) : s.settings.widgetY,
          },
        }))
      },
      resetWidgetPlace: () => {
        set((s) => ({ settings: { ...s.settings, widgetX: -1, widgetY: -1 } }))
      },
      openWidget: (run) => {
        unlockAudio()
        const now = Date.now()
        let cur = sanitize(get(), now)
        const looked = advance(cur, now)
        if (looked.finishedKinds.length > 0) {
          applyResult(looked, now)
          set({ widgetOpen: true })
          return
        }
        cur = looked.engine
        if (run && cur.phase !== "running") cur = beginRun(cur, now)
        set({ ...cur, widgetOpen: true, banner: null })
      },
      closeWidget: () => set({ widgetOpen: false }),
      finishOnboarding: () => set({ onboarded: true }),
    }),
    {
      name: "focus-store-v1",
      version: 1,
      partialize: (s) => toEngine(s),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          useFocus.setState({ hydrated: true })
          return
        }
        const patch = nativeClockPatch()
        if (patch) useFocus.setState(patch)
        state.reconcile()
      },
    },
  ),
)
