import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useFocus } from "@/lib/focus-store"

const NowContext = createContext(0)

export function useNow() {
  return useContext(NowContext)
}

export function ClockProvider({ children }: { children: ReactNode }) {
  const phase = useFocus((s) => s.phase)
  const endsAt = useFocus((s) => s.endsAt)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const catchUp = () => {
      const n = Date.now()
      setNow(n)
      useFocus.getState().tick(n)
    }
    document.addEventListener("visibilitychange", catchUp)
    window.addEventListener("pageshow", catchUp)
    return () => {
      document.removeEventListener("visibilitychange", catchUp)
      window.removeEventListener("pageshow", catchUp)
    }
  }, [])

  useEffect(() => {
    if (phase !== "running" || endsAt == null) return
    let timer = 0
    let dead = false
    const fire = () => {
      if (dead) return
      const n = Date.now()
      setNow(n)
      const state = useFocus.getState()
      const before = state.endsAt
      if (state.phase === "running" && before != null && n >= before - 20) {
        state.tick(n)
        const after = useFocus.getState()
        if (after.phase !== "running" || after.endsAt == null || after.endsAt !== before) return
      }
      const left = (state.endsAt ?? n) - n
      const mod = left % 1000
      timer = window.setTimeout(fire, mod <= 40 ? 1000 : mod)
    }
    fire()
    return () => {
      dead = true
      window.clearTimeout(timer)
    }
  }, [phase, endsAt])

  return <NowContext.Provider value={now}>{children}</NowContext.Provider>
}
