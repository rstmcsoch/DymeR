import { Logo } from "@/components/focus/logo"
import { useFocus } from "@/lib/focus-store"

const POINTS = [
  {
    n: "01",
    title: "Work in intervals",
    body: "Focus for a set time, then rest. After four focus sessions, take a longer break.",
  },
  {
    n: "02",
    title: "Time that stays honest",
    body: "The countdown follows the clock. Leave and come back, and it catches up.",
  },
  {
    n: "03",
    title: "A card that stays near",
    body: "Open the floating timer, drag it, and resize it. Closing the card does not reset your session.",
  },
]

export function Onboarding() {
  const finish = useFocus((s) => s.finishOnboarding)
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col px-[clamp(1rem,4.5vw,1.5rem)] pt-safe pb-8">
      <div className="flex items-center gap-3">
        <Logo className="size-10" alt="" />
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">DYPOL LABS</p>
      </div>
      <h1 className="mt-10 text-4xl font-semibold tracking-tight text-balance">Stay with the work.</h1>
      <p className="mt-3 text-base text-pretty text-muted">
        A private Pomodoro timer. Nothing leaves this device.
      </p>
      <ol className="mt-8 divide-y divide-line">
        {POINTS.map((point) => (
          <li key={point.n} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
            <span className="pt-0.5 text-sm font-semibold text-brand">{point.n}</span>
            <div>
              <h2 className="text-base font-semibold">{point.title}</h2>
              <p className="mt-1 text-sm text-pretty text-muted">{point.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-8">
        <button type="button" className="brand-btn w-full" onClick={finish} data-testid="begin">
          Begin
        </button>
      </div>
    </main>
  )
}
