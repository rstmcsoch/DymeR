import { useEffect, useState } from "react"
import { PictureInPicture2, Settings } from "lucide-react"
import { Logo } from "@/components/focus/logo"
import { Banner, Meter, SessionMark, statusLine } from "@/components/focus/ui"
import { useNow } from "@/components/focus/clock"
import { useFocus } from "@/lib/focus-store"
import { focusNative, hideNativeOverlay, nativeCanDraw, requestNativeOverlay } from "@/lib/native-overlay"
import { openPip, pipSupported } from "@/lib/pip"
import { formatClock, phaseLabel } from "@/lib/timer-engine"
import { APP_NAME } from "@/lib/brand"

export function HomeView({
  onSettings,
  onCustom,
}: {
  onSettings: () => void
  onCustom: () => void
}) {
  const now = useNow()
  const kind = useFocus((s) => s.kind)
  const phase = useFocus((s) => s.phase)
  const plannedMs = useFocus((s) => s.plannedMs)
  const remainingMs = useFocus((s) => s.remainingMs)
  const endsAt = useFocus((s) => s.endsAt)
  const widgetOpen = useFocus((s) => s.widgetOpen)
  const banner = useFocus((s) => s.banner)
  const todaySessions = useFocus((s) => s.todaySessions)
  const todayFocusMs = useFocus((s) => s.todayFocusMs)
  const openWidget = useFocus((s) => s.openWidget)
  const closeWidget = useFocus((s) => s.closeWidget)
  const armAndStart = useFocus((s) => s.armAndStart)
  const [pipReady, setPipReady] = useState(false)
  const [nativeReady, setNativeReady] = useState(false)
  const [canDraw, setCanDraw] = useState(false)
  const [pipNote, setPipNote] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => {
      const native = focusNative()
      setNativeReady(Boolean(native))
      setCanDraw(nativeCanDraw(native))
      setPipReady(!native && pipSupported())
    }
    sync()
    document.addEventListener("visibilitychange", sync)
    window.addEventListener("focus", sync)
    return () => {
      document.removeEventListener("visibilitychange", sync)
      window.removeEventListener("focus", sync)
    }
  }, [])

  const left = phase === "running" && endsAt != null ? Math.max(0, endsAt - now) : remainingMs
  const progress = plannedMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - left / plannedMs))
  const minutesToday = Math.round(todayFocusMs / 60000)
  const running = phase === "running"

  return (
    <div className="grid gap-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="size-7" alt="" />
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">DYPOL LABS</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Settings" onClick={onSettings}>
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div>
        <h1 className="app-title font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 max-w-sm text-pretty text-muted">
          Stay focused. Keep your timer within reach.
        </p>
      </div>

      <section className="surface grid gap-5 p-5" aria-label="Current session">
        <div className="flex items-center justify-between gap-3">
          <SessionMark kind={kind} />
          <span className="text-sm text-muted">{phaseLabel(phase)}</span>
        </div>
        <p className="clock clock-hero" data-testid="clock" aria-hidden="true">
          {formatClock(left)}
        </p>
        <p className="sr-only">{statusLine(kind, phase, left)}</p>
        <Meter progress={progress} />
        <p className="text-sm text-muted">
          {todaySessions === 0
            ? "No focus sessions yet today"
            : `Today · ${todaySessions} session${todaySessions === 1 ? "" : "s"} · ${minutesToday} min`}
        </p>
      </section>

      <Banner message={banner} />

      {widgetOpen ? (
        <button
          type="button"
          className="brand-btn w-full"
          onClick={() => {
            closeWidget()
            hideNativeOverlay()
          }}
          data-testid="float-toggle"
        >
          Hide floating widget
        </button>
      ) : (
        <button
          type="button"
          className="brand-btn w-full"
          onClick={() => {
            openWidget(true)
            requestNativeOverlay(true)
            if (focusNative() && !nativeCanDraw()) {
              setPipNote(`Allow ${APP_NAME} to appear above other apps, then come back. You only need to do this once.`)
            }
          }}
          data-testid="float-toggle"
        >
          Start floating widget
        </button>
      )}

      <p className="text-sm text-muted">
        Floating card: <span className="font-semibold text-fg">{widgetOpen ? "On" : "Off"}</span>
        {nativeReady ? (
          <>
            {" "}
            · Above other apps:{" "}
            <span className="font-semibold text-fg">{canDraw ? "Allowed" : "Needed"}</span>
          </>
        ) : null}
      </p>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">Quick start</p>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className="quiet-btn" disabled={running} onClick={() => { armAndStart(25); requestNativeOverlay(true) }}>
            25 min
          </button>
          <button type="button" className="quiet-btn" disabled={running} onClick={() => { armAndStart(50); requestNativeOverlay(true) }}>
            50 min
          </button>
          <button type="button" className="quiet-btn" disabled={running} onClick={onCustom}>
            Custom
          </button>
        </div>
        {running ? (
          <p className="mt-2 text-sm text-muted">Length changes apply after this session.</p>
        ) : null}
      </div>

      <div className="grid gap-3">
        {pipReady ? (
          <button
            type="button"
            className="quiet-btn w-full"
            onClick={() => {
              void openPip().then((result) => {
                if (result === "blocked") setPipNote("The browser blocked the floating window.")
                else setPipNote(null)
              })
            }}
          >
            <PictureInPicture2 className="size-4" aria-hidden="true" />
            Pin above other windows
          </button>
        ) : null}
        <p className="text-sm text-pretty text-muted">
          {nativeReady
            ? "The floating card stays above other apps even if you leave DymeR. Android asks for that permission once. Closing the card does not reset your session."
            : "The card floats over Focus while you use the timer. In Chrome, you can also pin it above other windows. Closing it never resets the session."}
        </p>
        {pipNote ? <p className="text-sm text-fg">{pipNote}</p> : null}
      </div>
    </div>
  )
}
