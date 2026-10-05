export type Kind = "focus" | "short" | "long"
export type Phase = "idle" | "running" | "paused"
export type ThemeMode = "system" | "light" | "dark"
export type WidgetSize = "sm" | "md" | "lg"

export const FOCUS_MIN = 1
export const FOCUS_MAX = 120
export const BREAK_MIN = 1
export const BREAK_MAX = 60
export const CYCLE = 4

export const WIDGET_WIDTH: Record<WidgetSize, number> = {
  sm: 210,
  md: 260,
  lg: 324,
}

export const WIDGET_HEIGHT: Record<WidgetSize, number> = {
  sm: 124,
  md: 164,
  lg: 220,
}

export type Settings = {
  focusMin: number
  shortMin: number
  longMin: number
  autoStart: boolean
  sound: boolean
  vibrate: boolean
  notify: boolean
  theme: ThemeMode
  widgetSize: WidgetSize
  widgetW: number
  widgetH: number
  widgetX: number
  widgetY: number
  rememberPlace: boolean
  opacity: number
}

export type Engine = {
  kind: Kind
  phase: Phase
  plannedMs: number
  durationMs: number
  remainingMs: number
  endsAt: number | null
  cycleFocus: number
  todayKey: string
  todaySessions: number
  todayFocusMs: number
  totalSessions: number
  totalFocusMs: number
  onboarded: boolean
  widgetOpen: boolean
  settings: Settings
}

export type AdvanceResult = {
  engine: Engine
  finishedKinds: Kind[]
  lastEndedAt: number | null
}

export function defaultSettings(): Settings {
  return {
    focusMin: 25,
    shortMin: 5,
    longMin: 15,
    autoStart: false,
    sound: true,
    vibrate: true,
    notify: false,
    theme: "system",
    widgetSize: "sm",
    widgetW: WIDGET_WIDTH.sm,
    widgetH: WIDGET_HEIGHT.sm,
    widgetX: -1,
    widgetY: -1,
    rememberPlace: true,
    opacity: 1,
  }
}

export function dayKey(now: number): string {
  const d = new Date(now)
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

export function createEngine(now = 0): Engine {
  const settings = defaultSettings()
  const plannedMs = settings.focusMin * 60_000
  return {
    kind: "focus",
    phase: "idle",
    plannedMs,
    durationMs: plannedMs,
    remainingMs: plannedMs,
    endsAt: null,
    cycleFocus: 0,
    todayKey: dayKey(now),
    todaySessions: 0,
    todayFocusMs: 0,
    totalSessions: 0,
    totalFocusMs: 0,
    onboarded: false,
    widgetOpen: false,
    settings,
  }
}

export function clampMinutes(kind: Kind, value: number): number {
  const n = Math.round(Number(value))
  if (kind === "focus") {
    if (!Number.isFinite(n)) return 25
    return Math.min(FOCUS_MAX, Math.max(FOCUS_MIN, n))
  }
  const fallback = kind === "short" ? 5 : 15
  if (!Number.isFinite(n)) return fallback
  return Math.min(BREAK_MAX, Math.max(BREAK_MIN, n))
}

export function durationFor(settings: Settings, kind: Kind): number {
  const min =
    kind === "focus" ? settings.focusMin : kind === "short" ? settings.shortMin : settings.longMin
  return clampMinutes(kind, min) * 60_000
}

export function formatClock(ms: number): string {
  const total = ms <= 0 ? 0 : Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, "0")
  const ss = String(s).padStart(2, "0")
  if (h > 0) return `${h}:${mm}:${ss}`
  return `${mm}:${ss}`
}

export function spokenTime(ms: number): string {
  const total = ms <= 0 ? 0 : Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`)
  if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`)
  if (s || parts.length === 0) parts.push(`${s} second${s === 1 ? "" : "s"}`)
  return parts.join(" ")
}

export function kindLabel(kind: Kind): string {
  if (kind === "focus") return "Focus"
  if (kind === "short") return "Short break"
  return "Long break"
}

export function phaseLabel(phase: Phase): string {
  if (phase === "running") return "In progress"
  if (phase === "paused") return "Paused"
  return "Ready"
}

export function progressOf(total: number, left: number): number {
  if (total <= 0) return 0
  return Math.min(1, Math.max(0, 1 - left / total))
}

export function widgetWidthClamp(width: number): number {
  const n = Math.round(width)
  if (!Number.isFinite(n)) return WIDGET_WIDTH.md
  return Math.min(460, Math.max(168, n))
}

export function widgetHeightClamp(height: number): number {
  const n = Math.round(height)
  if (!Number.isFinite(n) || n <= 0) return WIDGET_HEIGHT.md
  return Math.min(420, Math.max(96, n))
}

export function opacityClamp(value: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(1, Math.max(0.4, Math.round(n * 100) / 100))
}

export function nearestSize(width: number): WidgetSize {
  let best: WidgetSize = "md"
  let dist = Infinity
  for (const key of ["sm", "md", "lg"] as const) {
    const d = Math.abs(WIDGET_WIDTH[key] - width)
    if (d < dist) {
      dist = d
      best = key
    }
  }
  return best
}

function isKind(v: unknown): v is Kind {
  return v === "focus" || v === "short" || v === "long"
}
function isPhase(v: unknown): v is Phase {
  return v === "idle" || v === "running" || v === "paused"
}
function isTheme(v: unknown): v is ThemeMode {
  return v === "system" || v === "light" || v === "dark"
}
function isSize(v: unknown): v is WidgetSize {
  return v === "sm" || v === "md" || v === "lg"
}

function num(v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

export function sanitize(raw: unknown, now: number): Engine {
  const base = createEngine(now)
  if (!raw || typeof raw !== "object") return base
  const r = raw as Partial<Engine>
  const rs = (r.settings ?? {}) as Partial<Settings>
  const settings: Settings = {
    focusMin: clampMinutes("focus", rs.focusMin ?? base.settings.focusMin),
    shortMin: clampMinutes("short", rs.shortMin ?? base.settings.shortMin),
    longMin: clampMinutes("long", rs.longMin ?? base.settings.longMin),
    autoStart: Boolean(rs.autoStart),
    sound: rs.sound !== false,
    vibrate: rs.vibrate !== false,
    notify: Boolean(rs.notify),
    theme: isTheme(rs.theme) ? rs.theme : "system",
    widgetSize: isSize(rs.widgetSize) ? rs.widgetSize : "sm",
    widgetW: widgetWidthClamp(rs.widgetW ?? WIDGET_WIDTH.sm),
    widgetH: widgetHeightClamp(rs.widgetH ?? WIDGET_HEIGHT[isSize(rs.widgetSize) ? rs.widgetSize : "sm"]),
    widgetX: num(rs.widgetX, -1, -1, 10000),
    widgetY: num(rs.widgetY, -1, -1, 10000),
    rememberPlace: rs.rememberPlace !== false,
    opacity: opacityClamp(rs.opacity ?? 1),
  }
  const kind = isKind(r.kind) ? r.kind : "focus"
  let phase = isPhase(r.phase) ? r.phase : "idle"
  const plannedMs = num(r.plannedMs, durationFor(settings, kind), 60_000, FOCUS_MAX * 60_000)
  const durationMs = num(r.durationMs, plannedMs, 60_000, FOCUS_MAX * 60_000)
  let remainingMs = num(r.remainingMs, durationMs, 0, FOCUS_MAX * 60_000)
  let endsAt = typeof r.endsAt === "number" && Number.isFinite(r.endsAt) ? r.endsAt : null
  if (phase !== "running") endsAt = null
  if (phase === "running" && endsAt == null) endsAt = now + remainingMs
  if (phase !== "running") remainingMs = Math.min(remainingMs, plannedMs)
  return {
    kind,
    phase,
    plannedMs,
    durationMs,
    remainingMs,
    endsAt,
    cycleFocus: Math.round(num(r.cycleFocus, 0, 0, CYCLE - 1)),
    todayKey:
      typeof r.todayKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.todayKey) ? r.todayKey : dayKey(now),
    todaySessions: Math.round(num(r.todaySessions, 0, 0, 1_000_000)),
    todayFocusMs: num(r.todayFocusMs, 0, 0, 1e15),
    totalSessions: Math.round(num(r.totalSessions, 0, 0, 1_000_000_000)),
    totalFocusMs: num(r.totalFocusMs, 0, 0, 1e15),
    onboarded: Boolean(r.onboarded),
    widgetOpen: Boolean(r.widgetOpen),
    settings,
  }
}

function rollDay(engine: Engine, now: number): Engine {
  const key = dayKey(now)
  if (engine.todayKey === key) return engine
  return { ...engine, todayKey: key, todaySessions: 0, todayFocusMs: 0 }
}

function finishOne(engine: Engine, endedAt: number): Engine {
  let cycle = engine.cycleFocus
  let todaySessions = engine.todaySessions
  let todayFocusMs = engine.todayFocusMs
  let totalSessions = engine.totalSessions
  let totalFocusMs = engine.totalFocusMs
  if (engine.kind === "focus") {
    cycle = (cycle + 1) % CYCLE
    todaySessions += 1
    todayFocusMs += engine.plannedMs
    totalSessions += 1
    totalFocusMs += engine.plannedMs
  }
  const kind: Kind = engine.kind === "focus" ? (cycle === 0 ? "long" : "short") : "focus"
  const plannedMs = durationFor(engine.settings, kind)
  const shared = {
    ...engine,
    kind,
    plannedMs,
    durationMs: plannedMs,
    remainingMs: plannedMs,
    cycleFocus: cycle,
    todaySessions,
    todayFocusMs,
    totalSessions,
    totalFocusMs,
  }
  if (engine.settings.autoStart) {
    return { ...shared, phase: "running", endsAt: endedAt + plannedMs }
  }
  return { ...shared, phase: "idle", endsAt: null }
}

export function advance(engine: Engine, now: number): AdvanceResult {
  let next = rollDay(engine, now)
  const finishedKinds: Kind[] = []
  let lastEndedAt: number | null = null
  while (
    next.phase === "running" &&
    next.endsAt != null &&
    now >= next.endsAt &&
    finishedKinds.length < 48
  ) {
    finishedKinds.push(next.kind)
    lastEndedAt = next.endsAt
    next = finishOne(next, next.endsAt)
  }
  if (next.phase === "running" && next.endsAt != null) {
    next = { ...next, remainingMs: Math.max(0, next.endsAt - now) }
  }
  return { engine: next, finishedKinds, lastEndedAt }
}

export function beginRun(engine: Engine, now: number): Engine {
  const base = rollDay(engine, now)
  if (base.phase === "running") return base
  if (base.phase === "paused") {
    const left = Math.max(0, base.remainingMs)
    if (left <= 0) return advance({ ...base, phase: "running", endsAt: now, remainingMs: 0 }, now).engine
    return { ...base, phase: "running", endsAt: now + left }
  }
  const planned = Math.max(60_000, base.plannedMs)
  return {
    ...base,
    phase: "running",
    plannedMs: planned,
    durationMs: planned,
    remainingMs: planned,
    endsAt: now + planned,
  }
}

export function pauseRun(engine: Engine, now: number): Engine {
  if (engine.phase !== "running" || engine.endsAt == null) return engine
  return {
    ...engine,
    phase: "paused",
    remainingMs: Math.max(0, engine.endsAt - now),
    endsAt: null,
  }
}

export function restartRun(engine: Engine, now: number): Engine {
  const base = rollDay(engine, now)
  const planned = Math.max(60_000, base.plannedMs)
  const running = base.phase === "running"
  return {
    ...base,
    phase: running ? "running" : base.phase === "paused" ? "paused" : "idle",
    plannedMs: planned,
    durationMs: planned,
    remainingMs: planned,
    endsAt: running ? now + planned : null,
  }
}

export function skipRun(engine: Engine, now: number): Engine {
  const base = rollDay(engine, now)
  let cycle = base.cycleFocus
  let kind: Kind
  if (base.kind === "focus") {
    if (cycle >= CYCLE - 1) {
      kind = "long"
      cycle = 0
    } else {
      kind = "short"
    }
  } else {
    kind = "focus"
  }
  const plannedMs = durationFor(base.settings, kind)
  const running = base.phase === "running"
  return {
    ...base,
    kind,
    cycleFocus: cycle,
    phase: running ? "running" : "idle",
    plannedMs,
    durationMs: plannedMs,
    remainingMs: plannedMs,
    endsAt: running ? now + plannedMs : null,
  }
}

export function chooseKind(engine: Engine, kind: Kind, now: number): Engine {
  const base = rollDay(engine, now)
  if (base.phase !== "idle") return base
  const plannedMs = durationFor(base.settings, kind)
  return {
    ...base,
    kind,
    phase: "idle",
    plannedMs,
    durationMs: plannedMs,
    remainingMs: plannedMs,
    endsAt: null,
  }
}

export function armFocusMinutes(engine: Engine, minutes: number, now: number): Engine {
  const base = rollDay(engine, now)
  if (base.phase !== "idle") return base
  const plannedMs = clampMinutes("focus", minutes) * 60_000
  return {
    ...base,
    kind: "focus",
    phase: "idle",
    plannedMs,
    durationMs: plannedMs,
    remainingMs: plannedMs,
    endsAt: null,
  }
}

export function setKindMinutes(engine: Engine, kind: Kind, minutes: number, now: number): Engine {
  const base = rollDay(engine, now)
  const clamped = clampMinutes(kind, minutes)
  const key = kind === "focus" ? "focusMin" : kind === "short" ? "shortMin" : "longMin"
  const settings: Settings = { ...base.settings, [key]: clamped }
  let next: Engine = { ...base, settings }
  if (next.phase === "idle" && next.kind === kind) {
    const plannedMs = clamped * 60_000
    next = { ...next, plannedMs, durationMs: plannedMs, remainingMs: plannedMs, endsAt: null }
  }
  return next
}

export function completionCopy(kinds: Kind[], engine: Engine): { title: string; body: string } {
  if (kinds.length !== 1) {
    return { title: "Timer updated", body: "Sessions finished while you were away." }
  }
  if (kinds[0] === "focus") {
    return {
      title: "Focus complete",
      body: engine.kind === "long" ? "Time for a long break." : "Time for a short break.",
    }
  }
  return { title: "Break complete", body: "Ready for another focus session." }
}

export function toEngine(s: Engine): Engine {
  return {
    kind: s.kind,
    phase: s.phase,
    plannedMs: s.plannedMs,
    durationMs: s.durationMs,
    remainingMs: s.remainingMs,
    endsAt: s.endsAt,
    cycleFocus: s.cycleFocus,
    todayKey: s.todayKey,
    todaySessions: s.todaySessions,
    todayFocusMs: s.todayFocusMs,
    totalSessions: s.totalSessions,
    totalFocusMs: s.totalFocusMs,
    onboarded: s.onboarded,
    widgetOpen: s.widgetOpen,
    settings: s.settings,
  }
}
