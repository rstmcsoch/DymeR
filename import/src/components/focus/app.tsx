import { useEffect, useLayoutEffect, useState } from "react"
import { AboutView } from "@/components/focus/about-view"
import { ClockProvider } from "@/components/focus/clock"
import { HomeView } from "@/components/focus/home-view"
import { Logo } from "@/components/focus/logo"
import { NavBar, type Tab } from "@/components/focus/nav-bar"
import { Onboarding } from "@/components/focus/onboarding"
import { CustomDialog, SettingsSheet } from "@/components/focus/settings-sheet"
import { TimerView } from "@/components/focus/timer-view"
import { FloatingWidget } from "@/components/focus/widget"
import { applyTheme } from "@/lib/feedback"
import { useFocus } from "@/lib/focus-store"
import { APP_NAME } from "@/lib/brand"
import { focusNative } from "@/lib/native-overlay"

export function FocusApp() {
  const hydrated = useFocus((s) => s.hydrated)
  const onboarded = useFocus((s) => s.onboarded)
  const theme = useFocus((s) => s.settings.theme)
  const phase = useFocus((s) => s.phase)
  const widgetOpen = useFocus((s) => s.widgetOpen)
  const widgetX = useFocus((s) => s.settings.widgetX)
  const widgetW = useFocus((s) => s.settings.widgetW)
  const [tab, setTab] = useState<Tab>("home")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)

  useEffect(() => {
    if (!useFocus.persist.hasHydrated()) void useFocus.persist.rehydrate()
  }, [])

  useLayoutEffect(() => {
    if (!hydrated) {
      const stored = localStorage.getItem("focus-theme")
      if (stored === "light" || stored === "dark" || stored === "system") applyTheme(stored)
      else applyTheme("system")
      return
    }
    applyTheme(theme)
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme("system")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme, hydrated])

  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    let dead = false
    const acquire = () => {
      if (dead || phase !== "running" || !("wakeLock" in navigator)) return
      void navigator.wakeLock
        .request("screen")
        .then((sent) => {
          if (dead) void sent.release()
          else lock = sent
        })
        .catch(() => {})
    }
    const onVis = () => {
      if (document.visibilityState === "visible") acquire()
    }
    acquire()
    document.addEventListener("visibilitychange", onVis)
    return () => {
      dead = true
      document.removeEventListener("visibilitychange", onVis)
      void lock?.release().catch(() => {})
    }
  }, [phase])

  if (!hydrated) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="grid justify-items-center gap-3">
          <Logo className="size-10" alt="DYPOL LABS" />
          <p className="text-sm font-semibold">{APP_NAME}</p>
        </div>
      </main>
    )
  }

  if (!onboarded) return <Onboarding />

  const nativeBubble = typeof window !== "undefined" && Boolean(focusNative())
  const docked = widgetOpen && !nativeBubble && widgetX < 0
  const pad = !docked ? "pt-safe" : widgetW >= 300 ? "pt-64" : widgetW >= 248 ? "pt-52" : "pt-32"

  return (
    <ClockProvider>
      <main className={`mx-auto min-h-dvh w-full max-w-[34rem] px-[clamp(1rem,4.5vw,1.5rem)] pb-safe-nav ${pad}`}>
        {tab === "home" ? <HomeView onSettings={() => setSettingsOpen(true)} onCustom={() => setCustomOpen(true)} /> : null}
        {tab === "timer" ? <TimerView onSettings={() => setSettingsOpen(true)} /> : null}
        {tab === "about" ? <AboutView /> : null}
      </main>
      <NavBar tab={tab} onTab={setTab} />
      <FloatingWidget />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CustomDialog open={customOpen} onOpenChange={setCustomOpen} />
    </ClockProvider>
  )
}
