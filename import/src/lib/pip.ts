import { useFocus } from "@/lib/focus-store"
import { formatClock, kindLabel, type Phase } from "@/lib/timer-engine"

type PipApi = {
  requestWindow: (opts?: { width?: number; height?: number }) => Promise<Window>
}

function pipApi(): PipApi | null {
  if (typeof window === "undefined") return null
  const host = window as unknown as { documentPictureInPicture?: PipApi }
  return host.documentPictureInPicture ?? null
}

export function pipSupported(): boolean {
  return pipApi() != null
}

let pipWindow: Window | null = null
let stopListen: (() => void) | null = null

const PIP_CSS = `
  :root { color-scheme: light; --bg:#1a1014; --fg:#fff8f8; --muted:#f0c9d0; --line:#ffffff33; --a:#c4163c; --b:#e4376a; }
  html, body { margin:0; height:100%; background:var(--bg); color:var(--fg); font-family:Outfit, ui-sans-serif, system-ui, sans-serif; }
  body { display:grid; place-items:center; }
  .card { width:100%; height:100%; box-sizing:border-box; padding:16px 18px; display:flex; flex-direction:column; justify-content:space-between;
    background: linear-gradient(160deg, #2a141b, #1a1014 55%); }
  .kicker { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:650; }
  .time { font-size:42px; line-height:1; font-weight:650; letter-spacing:-.04em; font-variant-numeric:tabular-nums; }
  .row { display:flex; gap:8px; }
  button { appearance:none; border:0; border-radius:999px; min-height:44px; padding:0 14px; font:inherit; font-weight:650; cursor:pointer; }
  .go { color:#fff; background:linear-gradient(135deg, var(--a), var(--b)); flex:1; }
  .ghost { background:transparent; color:var(--fg); border:1px solid var(--line); }
`

function paint(doc: Document) {
  const s = useFocus.getState()
  const now = Date.now()
  const left = s.phase === "running" && s.endsAt != null ? Math.max(0, s.endsAt - now) : s.remainingMs
  const time = doc.getElementById("pip-time")
  const kind = doc.getElementById("pip-kind")
  const go = doc.getElementById("pip-go")
  if (time) time.textContent = formatClock(left)
  if (kind) kind.textContent = kindLabel(s.kind)
  if (go) {
    const label = labelFor(s.phase)
    go.textContent = label
    go.setAttribute("aria-label", label)
  }
}

function labelFor(phase: Phase): string {
  if (phase === "running") return "Pause"
  if (phase === "paused") return "Resume"
  return "Start"
}

export async function openPip(): Promise<"ok" | "unsupported" | "blocked"> {
  const api = pipApi()
  if (!api) return "unsupported"
  try {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.focus()
      return "ok"
    }
    const win = await api.requestWindow({ width: 300, height: 180 })
    pipWindow = win
    const doc = win.document
    doc.title = "Focus"
    const style = doc.createElement("style")
    style.textContent = PIP_CSS
    doc.head.appendChild(style)
    doc.body.innerHTML = `
      <div class="card">
        <div>
          <div class="kicker" id="pip-kind">Focus</div>
          <div class="time" id="pip-time">25:00</div>
        </div>
        <div class="row">
          <button class="go" id="pip-go" type="button">Start</button>
          <button class="ghost" id="pip-close" type="button">Close</button>
        </div>
      </div>`
    doc.getElementById("pip-go")?.addEventListener("click", () => useFocus.getState().toggleRun())
    doc.getElementById("pip-close")?.addEventListener("click", () => win.close())
    paint(doc)
    const unsub = useFocus.subscribe(() => paint(doc))
    const timer = win.setInterval(() => paint(doc), 1000)
    const cleanup = () => {
      unsub()
      win.clearInterval(timer)
      if (pipWindow === win) pipWindow = null
      stopListen = null
    }
    stopListen = cleanup
    win.addEventListener("pagehide", cleanup)
    return "ok"
  } catch {
    return "blocked"
  }
}

export function closePip() {
  stopListen?.()
  pipWindow?.close()
  pipWindow = null
}
