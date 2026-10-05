import assert from "node:assert/strict"
import { test } from "node:test"
import {
  advance,
  armFocusMinutes,
  beginRun,
  clampMinutes,
  createEngine,
  formatClock,
  pauseRun,
  restartRun,
  sanitize,
  setKindMinutes,
  skipRun,
} from "./timer-engine.ts"

const MIN = 60_000

test("clock rounds up so a full minute does not drop early", () => {
  assert.equal(formatClock(0), "00:00")
  assert.equal(formatClock(1), "00:01")
  assert.equal(formatClock(1000), "00:01")
  assert.equal(formatClock(1001), "00:02")
  assert.equal(formatClock(25 * MIN), "25:00")
  assert.equal(formatClock(90 * MIN), "1:30:00")
})

test("start, pause, and resume keep the exact remainder", () => {
  const t0 = 1_000_000
  let e = beginRun(createEngine(t0), t0)
  assert.equal(e.phase, "running")
  assert.equal(e.endsAt, t0 + 25 * MIN)
  const paused = pauseRun(e, t0 + 10_000)
  assert.equal(paused.phase, "paused")
  assert.equal(paused.endsAt, null)
  assert.equal(paused.remainingMs, 25 * MIN - 10_000)
  const later = t0 + 500_000
  const resumed = beginRun(paused, later)
  assert.equal(resumed.endsAt, later + (25 * MIN - 10_000))
  const shown = advance(resumed, later + 1000).engine
  assert.equal(shown.remainingMs, 25 * MIN - 10_000 - 1000)
})

test("leaving and returning catches the real remaining time", () => {
  const t0 = 5_000
  const e = beginRun(createEngine(t0), t0)
  const back = advance(e, t0 + 5 * MIN).engine
  assert.equal(back.phase, "running")
  assert.equal(back.kind, "focus")
  assert.equal(back.remainingMs, 20 * MIN)
  assert.equal(back.todaySessions, 0)
})

test("completion moves to a short break without auto-start", () => {
  const t0 = 0
  const e = beginRun(createEngine(t0), t0)
  const done = advance(e, t0 + 25 * MIN)
  assert.deepEqual(done.finishedKinds, ["focus"])
  assert.equal(done.engine.phase, "idle")
  assert.equal(done.engine.kind, "short")
  assert.equal(done.engine.plannedMs, 5 * MIN)
  assert.equal(done.engine.todaySessions, 1)
  assert.equal(done.engine.cycleFocus, 1)
})

test("the fourth focus earns a long break", () => {
  let now = 10_000
  let e = createEngine(now)
  for (let i = 0; i < 4; i++) {
    e = beginRun(e, now)
    assert.equal(e.kind, "focus")
    const step = advance(e, e.endsAt ?? now)
    e = step.engine
    now = (step.lastEndedAt ?? now) + 1
    if (i < 3) {
      assert.equal(e.kind, "short")
      e = beginRun(e, now)
      const br = advance(e, e.endsAt ?? now)
      e = br.engine
      now = (br.lastEndedAt ?? now) + 1
    }
  }
  assert.equal(e.kind, "long")
  assert.equal(e.phase, "idle")
  assert.equal(e.cycleFocus, 0)
  assert.equal(e.todaySessions, 4)
  assert.equal(e.plannedMs, 15 * MIN)
})

test("auto-start catches up across several sessions", () => {
  let e = createEngine(0)
  e = setKindMinutes(e, "focus", 1, 0)
  e = setKindMinutes(e, "short", 1, 0)
  e = setKindMinutes(e, "long", 1, 0)
  e = { ...e, settings: { ...e.settings, autoStart: true } }
  e = beginRun(e, 0)
  const result = advance(e, 181_000)
  assert.deepEqual(result.finishedKinds, ["focus", "short", "focus"])
  assert.equal(result.engine.phase, "running")
  assert.equal(result.engine.kind, "short")
  assert.equal(result.engine.todaySessions, 2)
  assert.equal(result.engine.cycleFocus, 2)
  assert.equal(result.engine.remainingMs, 60_000 - 1_000)
})

test("skip does not count a focus session", () => {
  const e = beginRun(createEngine(0), 0)
  const next = skipRun(e, 5_000)
  assert.equal(next.kind, "short")
  assert.equal(next.phase, "running")
  assert.equal(next.todaySessions, 0)
  assert.equal(next.cycleFocus, 0)
})

test("restart restores the armed length while running", () => {
  let e = armFocusMinutes(createEngine(0), 50, 0)
  e = beginRun(e, 0)
  const restarted = restartRun(e, 8_000)
  assert.equal(restarted.phase, "running")
  assert.equal(restarted.plannedMs, 50 * MIN)
  assert.equal(restarted.endsAt, 8_000 + 50 * MIN)
  assert.equal(restarted.settings.focusMin, 25)
})

test("changing minutes while running does not reset the session", () => {
  const e = beginRun(createEngine(0), 0)
  const next = setKindMinutes(e, "focus", 40, 3_000)
  assert.equal(next.endsAt, 25 * MIN)
  assert.equal(next.settings.focusMin, 40)
  assert.equal(next.plannedMs, 25 * MIN)
  const idle = advance(next, 25 * MIN).engine
  assert.equal(idle.kind, "short")
  const again = chooseFocusAfter(idle)
  assert.equal(again.settings.focusMin, 40)
})

function chooseFocusAfter(e: ReturnType<typeof createEngine>) {
  let cur = e
  if (cur.kind !== "focus") {
    cur = beginRun(cur, cur.endsAt ?? 0)
    cur = advance(cur, cur.endsAt ?? 0).engine
  }
  return cur
}

test("invalid values are clamped and corrupt state is safe", () => {
  assert.equal(clampMinutes("focus", 0), 1)
  assert.equal(clampMinutes("focus", 500), 120)
  assert.equal(clampMinutes("short", 0), 1)
  assert.equal(clampMinutes("long", 90), 60)
  const clean = sanitize({ phase: "running", endsAt: null, plannedMs: 0, kind: "nope" }, 50_000)
  assert.equal(clean.kind, "focus")
  assert.equal(clean.phase, "running")
  assert.ok(clean.endsAt != null)
  assert.ok(clean.plannedMs >= MIN)
})
