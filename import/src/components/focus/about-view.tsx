import { Globe, Mail, Shield } from "lucide-react"
import { Logo } from "@/components/focus/logo"
import { APP_NAME, EMAIL, SITE, SITE_LABEL, STUDIO, VERSION } from "@/lib/brand"
import { useFocus } from "@/lib/focus-store"

export function AboutView() {
  const totalSessions = useFocus((s) => s.totalSessions)
  const totalFocusMs = useFocus((s) => s.totalFocusMs)
  const minutes = Math.round(totalFocusMs / 60000)

  return (
    <div className="grid gap-6">
      <header className="flex items-center gap-3">
        <Logo className="size-12" alt="" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-muted">Version {VERSION}</p>
        </div>
      </header>
      <p className="text-pretty text-muted">
        A calm Pomodoro timer for study and deep work, with a floating card that keeps the countdown in sight.
      </p>
      <p className="text-sm text-muted">
        {totalSessions === 0
          ? "No focus sessions recorded yet."
          : `${totalSessions} focus session${totalSessions === 1 ? "" : "s"} · ${minutes} minutes on this device.`}
      </p>
      <section className="surface px-4">
        <h2 className="sr-only">Studio</h2>
        <p className="border-b border-line py-4 text-sm">
          Created and crafted by <span className="font-semibold text-fg">{STUDIO}</span>
        </p>
        <a className="flex items-center gap-3 border-b border-line py-4" href={`mailto:${EMAIL}`}>
          <Mail className="size-4 text-brand" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold">Email</span>
            <span className="block text-sm text-muted">{EMAIL}</span>
          </span>
        </a>
        <a className="flex items-center gap-3 py-4" href={SITE} target="_blank" rel="noreferrer">
          <Globe className="size-4 text-brand" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold">Website</span>
            <span className="block text-sm text-muted">{SITE_LABEL}</span>
          </span>
        </a>
      </section>
      <section className="flex gap-3 text-sm text-pretty text-muted">
        <Shield className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
        <p>
          Timer, settings, and history stay on this device. No account, no ads, and no network required to run a
          session.
        </p>
      </section>
    </div>
  )
}
