import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { FocusApp } from "@/components/focus/app"
import { useFocus } from "@/lib/focus-store"
import { adoptNativeClock, focusNative, overlaySnapshot, requestNativeOverlay } from "@/lib/native-overlay"
import "@/styles.css"

declare global {
  interface Window {
    __focusSyncNative?: () => void
    __focusAfterPermission?: () => void
    __focusCloseWidget?: () => void
    __focusWidgetBox?: (x: number, y: number, w: number, h: number) => void
  }
}

window.__focusSyncNative = () => {
  adoptNativeClock()
}

window.__focusCloseWidget = () => {
  useFocus.getState().closeWidget()
}

window.__focusWidgetBox = (x, y, w, h) => {
  useFocus.getState().commitWidget({ x, y, w, h })
}

window.__focusAfterPermission = () => {
  const pending = focusNative()?.consumePending?.() ?? ""
  if (pending === "close") useFocus.getState().closeWidget()
  else adoptNativeClock()
  if (useFocus.getState().widgetOpen) requestNativeOverlay(false)
}

let widgetWasOpen = false
let seenLayout = false
let lastW = 0
let lastH = 0
useFocus.subscribe((state) => {
  const native = focusNative()
  if (!native || !state.hydrated) return
  if (!state.widgetOpen) {
    if (widgetWasOpen) native.hide()
    widgetWasOpen = false
    return
  }
  widgetWasOpen = true
  const layout = seenLayout && (state.settings.widgetW !== lastW || state.settings.widgetH !== lastH)
  seenLayout = true
  lastW = state.settings.widgetW
  lastH = state.settings.widgetH
  if (!native.canDraw()) return
  const snap = overlaySnapshot(layout)
  if (native.ensure) native.ensure(snap, false)
  else native.update(snap)
})

useFocus.persist.onFinishHydration(() => {
  if (useFocus.getState().widgetOpen) requestNativeOverlay(false)
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FocusApp />
  </StrictMode>,
)
