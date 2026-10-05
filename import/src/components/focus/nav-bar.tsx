import { House, Info, Timer } from "lucide-react"

export type Tab = "home" | "timer" | "about"

const ITEMS: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "timer", label: "Timer", icon: Timer },
  { id: "about", label: "About", icon: Info },
]

export function NavBar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  const index = Math.max(0, ITEMS.findIndex((item) => item.id === tab))
  return (
    <nav aria-label="Primary" className="fixed bottom-safe left-1/2 z-30 nav-width -translate-x-1/2">
      <div className="nav-shell relative">
        <span className="nav-indicator" data-i={String(index)} aria-hidden="true" />
        {ITEMS.map((item) => {
          const Icon = item.icon
          const current = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              className="nav-item"
              aria-current={current ? "page" : undefined}
              onClick={() => onTab(item.id)}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="size-5" strokeWidth={current ? 2.4 : 1.8} aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
