import { useId, type ReactNode } from "react"
import { kindLabel, phaseLabel, progressOf, spokenTime, type Kind, type Phase } from "@/lib/timer-engine"

export function SessionMark({ kind }: { kind: Kind }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase">
      <span className="size-1.5 rounded-full bg-mark" aria-hidden="true" />
      {kindLabel(kind)}
    </span>
  )
}

export function ProgressRing({
  progress,
  children,
}: {
  progress: number
  children: ReactNode
}) {
  const id = useId()
  const r = 46
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, Math.max(0, progress)))
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-72 place-items-center">
      <svg viewBox="0 0 120 120" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-a)" />
            <stop offset="100%" stopColor="var(--brand-b)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 200ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center px-8 text-center">{children}</div>
    </div>
  )
}

export function Meter({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-chip" aria-hidden="true">
      <div
        className="h-full rounded-full bg-brand"
        style={{ width: `${Math.round(progress * 100)}%`, transition: "width 200ms linear" }}
      />
    </div>
  )
}

export function Banner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="status" className="rounded-2xl bg-soft px-4 py-3 text-center text-sm text-fg">
      {message}
    </p>
  )
}

export function statusLine(kind: Kind, phase: Phase, left: number) {
  return `${kindLabel(kind)}. ${spokenTime(left)} remaining. ${phaseLabel(phase)}.`
}

export function longHint(kind: Kind, cycleFocus: number): string {
  if (kind === "long") return "A longer rest"
  if (kind === "short") return "A short rest"
  const left = 4 - cycleFocus
  if (left <= 1) return "Long break is next"
  return `Long break in ${left} focus sessions`
}

export { progressOf }
