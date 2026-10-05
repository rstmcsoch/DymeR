import type { ThemeMode } from "@/lib/timer-engine"

let audioCtx: AudioContext | null = null

export function unlockAudio() {
  if (typeof window === "undefined") return
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return
  audioCtx = audioCtx ?? new Ctx()
  if (audioCtx.state === "suspended") void audioCtx.resume()
}

export function playChime() {
  if (!audioCtx) return
  const ctx = audioCtx
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    const t = now + i * 0.08
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.3)
  })
}

export function vibrateDone() {
  try {
    navigator.vibrate?.([28, 36, 28, 36, 70])
  } catch {
    /* unsupported */
  }
}

export function notifyDone(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return
  try {
    new Notification(title, { body, tag: "focus-timer" })
  } catch {
    /* ignore */
  }
}

export async function requestNotify(): Promise<boolean> {
  if (typeof Notification === "undefined") return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  try {
    return (await Notification.requestPermission()) === "granted"
  } catch {
    return false
  }
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.style.colorScheme = dark ? "dark" : "light"
  try {
    localStorage.setItem("focus-theme", theme)
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute("content", dark ? "#120d0f" : "#f7f2ef")
}

export function signalDone(opts: {
  sound: boolean
  vibrate: boolean
  notify: boolean
  audible: boolean
  title: string
  body: string
}) {
  if (opts.audible && opts.sound) playChime()
  if (opts.audible && opts.vibrate) vibrateDone()
  if (opts.notify && typeof document !== "undefined" && document.hidden) {
    notifyDone(opts.title, opts.body)
  }
}
