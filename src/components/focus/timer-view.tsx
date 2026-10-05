import { Pause, Play, RotateCcw, Settings, SkipForward } from "lucide-react"
import { useNow } from "@/components/focus/clock"
import { Banner, longHint, ProgressRing, SessionMark, statusLine } from "@/components/focus/ui"
import { useFocus } from "@/lib/focus-store"
import { formatClock, kindLabel, type Kind } from "@/lib/timer-engine"

const KINDS: Kind[] = ["focus", "short", "long"]

export function TimerView({ onSettings }: { onSettings: () => void }) {
  const now = useNow()
  const kind = useFocus((s) => s.kind)
  const phase = useFocus((s) => s.phase)
  const plannedMs = useFocus((s) => s.plannedMs)
  const remainingMs = useFocus((s) => s.remainingMs)
  const endsAt = useFocus((s) => s.endsAt)
  const cycleFocus = useFocus((s) => s.cycleFocus)
  const todaySessions = useFocus((s) => s.todaySessions)
  const banner = useFocus((s) => s.banner)
  const toggleRun = useFocus((s) => s.toggleRun)
  const restart = useFocus((s) => s.restart)
  const skip = useFocus((s) => s.skip)
  const choose = useFocus((s) => s.choose)

  const left = phase === "running" && endsAt != null ? Math.max(0, endsAt - now) : remainingMs
  const progress = plannedMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - left / plannedMs))
  const primary = phase === "running" ? "Pause" : phase === "paused" ? "Resume" : "Start"
  const Icon = phase === "running" ? Pause : Play

  return (
    <div className="grid gap-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="sr-only">Timer</h1>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Session type">
          {KINDS.map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              aria-pressed={kind === item}
              disabled={phase !== "idle"}
              onClick={() => choose(item)}
            >
              {kindLabel(item)}
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn shrink-0" aria-label="Settings" onClick={onSettings}>
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="grid justify-items-center gap-4" aria-label="Countdown">
        <SessionMark kind={kind} />
        <ProgressRing progress={progress}>
          <div>
            <p className="clock text-5xl" data-testid="clock" aria-hidden="true">
              {formatClock(left)}
            </p>
            <p className="mt-2 text-sm text-muted">{primary === "Start" ? "Ready" : primary === "Pause" ? "In progress" : "Paused"}</p>
          </div>
        </ProgressRing>
        <p className="sr-only">{statusLine(kind, phase, left)}</p>
      </section>

      <Banner message={banner} />

      <div className="grid gap-3">
        <button type="button" className="brand-btn w-full" onClick={toggleRun} data-testid="primary-action">
          <Icon className="size-5" aria-hidden="true" />
          {primary}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="quiet-btn" onClick={restart}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Restart
          </button>
          <button type="button" className="quiet-btn" onClick={skip}>
            <SkipForward className="size-4" aria-hidden="true" />
            Skip
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        {longHint(kind, cycleFocus)}
        <span aria-hidden="true"> · </span>
        <span>
          {todaySessions} focus session{todaySessions === 1 ? "" : "s"} today
        </span>
      </p>
    </div>
  )
}
