import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useFocus } from "@/lib/focus-store"
import { requestNativeOverlay } from "@/lib/native-overlay"
import { BREAK_MAX, FOCUS_MAX, type Kind, type ThemeMode, type WidgetSize } from "@/lib/timer-engine"

export function SettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="surface fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[86dvh] w-full max-w-[34rem] overflow-y-auto rounded-b-none p-5 pb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Dialog.Title className="text-xl font-semibold">Settings</Dialog.Title>
            <Dialog.Close className="icon-btn" aria-label="Close settings">
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Timer, alerts, appearance, and floating widget.</Dialog.Description>
          <SettingsForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SettingsForm() {
  const settings = useFocus((s) => s.settings)
  const phase = useFocus((s) => s.phase)
  const kind = useFocus((s) => s.kind)
  const setMinutes = useFocus((s) => s.setMinutes)
  const setTheme = useFocus((s) => s.setTheme)
  const setFlag = useFocus((s) => s.setFlag)
  const setNotify = useFocus((s) => s.setNotify)
  const setWidgetSize = useFocus((s) => s.setWidgetSize)
  const setOpacity = useFocus((s) => s.setOpacity)
  const resetWidgetPlace = useFocus((s) => s.resetWidgetPlace)
  const [notifyHint, setNotifyHint] = useState<string | null>(null)

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <h2 className="text-sm font-semibold">Timer</h2>
        <Minutes
          label="Focus"
          kind="focus"
          min={1}
          max={FOCUS_MAX}
          value={settings.focusMin}
          pending={phase === "running" && kind === "focus"}
          onChange={(n) => setMinutes("focus", n)}
        />
        <Minutes
          label="Short break"
          kind="short"
          min={1}
          max={BREAK_MAX}
          value={settings.shortMin}
          pending={phase === "running" && kind === "short"}
          onChange={(n) => setMinutes("short", n)}
        />
        <Minutes
          label="Long break"
          kind="long"
          min={1}
          max={BREAK_MAX}
          value={settings.longMin}
          pending={phase === "running" && kind === "long"}
          onChange={(n) => setMinutes("long", n)}
        />
        <Toggle
          label="Auto-start next session"
          hint="Starts the next session when one ends."
          on={settings.autoStart}
          onChange={(v) => setFlag("autoStart", v)}
        />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Alerts</h2>
        <Toggle label="Sound" on={settings.sound} onChange={(v) => setFlag("sound", v)} />
        <Toggle label="Vibration" on={settings.vibrate} onChange={(v) => setFlag("vibrate", v)} />
        <Toggle
          label="Notify when a session ends"
          hint={notifyHint ?? "Shown if Focus is in the background."}
          on={settings.notify}
          onChange={(v) => {
            void setNotify(v).then(() => {
              if (v && typeof Notification !== "undefined" && Notification.permission === "denied") {
                setNotifyHint("Notifications are blocked in the browser.")
              } else {
                setNotifyHint(null)
              }
            })
          }}
        />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Appearance</h2>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Theme">
          {(
            [
              ["system", "System"],
              ["light", "Light"],
              ["dark", "Dark"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="chip"
              aria-pressed={settings.theme === id}
              onClick={() => setTheme(id as ThemeMode)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold">Floating widget</h2>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Widget size">
          {(
            [
              ["sm", "Small"],
              ["md", "Medium"],
              ["lg", "Large"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="chip"
              aria-pressed={settings.widgetSize === id}
              onClick={() => setWidgetSize(id as WidgetSize)}
            >
              {label}
            </button>
          ))}
        </div>
        <Toggle
          label="Remember position"
          on={settings.rememberPlace}
          onChange={(v) => setFlag("rememberPlace", v)}
        />
        <label className="grid gap-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">Transparency</span>
            <span className="clock text-sm">{Math.round((1 - (settings.opacity ?? 1)) * 100)}%</span>
          </span>
          <input
            className="range"
            type="range"
            min={0}
            max={60}
            step={1}
            value={Math.round((1 - (settings.opacity ?? 1)) * 100)}
            aria-label="Floating timer transparency"
            aria-valuetext={`${Math.round((1 - (settings.opacity ?? 1)) * 100)} percent transparent`}
            onChange={(e) => setOpacity(1 - Number(e.target.value) / 100)}
          />
          <span className="text-xs text-muted">How see-through the floating timer is. 0% is solid.</span>
        </label>
        <button type="button" className="quiet-btn" onClick={resetWidgetPlace}>
          Reset position
        </button>
      </section>
    </div>
  )
}

function Minutes({
  label,
  kind,
  min,
  max,
  value,
  pending,
  onChange,
}: {
  label: string
  kind: Kind
  min: number
  max: number
  value: number
  pending: boolean
  onChange: (n: number) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="clock text-sm">{value} min</span>
      </span>
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={`${label} minutes`}
        aria-valuetext={`${value} minutes`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="text-xs text-muted">
        {min}–{max} min{pending ? " · applies to the next session" : ""}
        <span className="sr-only"> for {kind}</span>
      </span>
    </label>
  )
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string
  hint?: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex min-h-11 items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full ${on ? "bg-brand" : "bg-chip"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-card shadow-card ${on ? "translate-x-5" : ""}`}
          style={{ transition: "transform 160ms ease" }}
        />
      </span>
    </button>
  )
}

export function CustomDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const focusMin = useFocus((s) => s.settings.focusMin)
  const phase = useFocus((s) => s.phase)
  const armAndStart = useFocus((s) => s.armAndStart)
  const [mins, setMins] = useState(focusMin)

  useEffect(() => {
    if (open) setMins(focusMin)
  }, [open, focusMin])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="surface fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,22rem)] -translate-x-1/2 -translate-y-1/2 p-5">
          <Dialog.Title className="text-lg font-semibold">Custom focus</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">Choose a length from 1 to 120 minutes.</Dialog.Description>
          <p className="clock mt-5 text-center text-5xl">{mins}</p>
          <p className="mb-3 text-center text-sm text-muted">minutes</p>
          <input
            className="range"
            type="range"
            min={1}
            max={120}
            value={mins}
            aria-label="Focus minutes"
            onChange={(e) => setMins(Number(e.target.value))}
          />
          <button
            type="button"
            className="brand-btn mt-5 w-full"
            disabled={phase !== "idle"}
            onClick={() => {
              armAndStart(mins)
              requestNativeOverlay(true)
              onOpenChange(false)
            }}
          >
            {phase === "idle" ? "Start focus" : "Session already running"}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
