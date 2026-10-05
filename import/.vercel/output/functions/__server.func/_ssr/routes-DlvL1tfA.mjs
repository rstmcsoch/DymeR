import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Shield, c as Play, d as Mail, f as Info, i as SkipForward, l as PictureInPicture2, m as Globe, o as Settings, p as House, r as Timer, s as RotateCcw, t as X, u as Pause } from "../_libs/lucide-react.mjs";
import { a as SITE_LABEL, i as SITE, n as APP_NAME, o as STUDIO, r as EMAIL, s as VERSION } from "./router-BSMKjcxW.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DlvL1tfA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var dypol_logo_default = "/assets/dypol-logo-Bh32MPnU.png";
function Logo({ className = "size-8", alt = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: dypol_logo_default,
		alt,
		width: 128,
		height: 128,
		draggable: false,
		className: `shrink-0 rounded-full object-cover ${className}`
	});
}
var audioCtx = null;
function unlockAudio() {
	if (typeof window === "undefined") return;
	const Ctx = window.AudioContext || window.webkitAudioContext;
	if (!Ctx) return;
	audioCtx = audioCtx ?? new Ctx();
	if (audioCtx.state === "suspended") audioCtx.resume();
}
function playChime() {
	if (!audioCtx) return;
	const ctx = audioCtx;
	const now = ctx.currentTime;
	[
		523.25,
		659.25,
		783.99
	].forEach((freq, i) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = freq;
		const t = now + i * .08;
		gain.gain.setValueAtTime(1e-4, t);
		gain.gain.exponentialRampToValueAtTime(.05, t + .02);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .28);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(t);
		osc.stop(t + .3);
	});
}
function vibrateDone() {
	try {
		navigator.vibrate?.([
			28,
			36,
			28,
			36,
			70
		]);
	} catch {}
}
function notifyDone(title, body) {
	if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
	try {
		new Notification(title, {
			body,
			tag: "focus-timer"
		});
	} catch {}
}
async function requestNotify() {
	if (typeof Notification === "undefined") return false;
	if (Notification.permission === "granted") return true;
	if (Notification.permission === "denied") return false;
	try {
		return await Notification.requestPermission() === "granted";
	} catch {
		return false;
	}
}
function applyTheme(theme) {
	if (typeof document === "undefined") return;
	const dark = theme === "dark" || theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
	document.documentElement.classList.toggle("dark", dark);
	document.documentElement.style.colorScheme = dark ? "dark" : "light";
	try {
		localStorage.setItem("focus-theme", theme);
	} catch {}
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", dark ? "#120d0f" : "#f7f2ef");
}
function signalDone(opts) {
	if (opts.audible && opts.sound) playChime();
	if (opts.audible && opts.vibrate) vibrateDone();
	if (opts.notify && typeof document !== "undefined" && document.hidden) notifyDone(opts.title, opts.body);
}
var WIDGET_WIDTH = {
	sm: 210,
	md: 260,
	lg: 324
};
function defaultSettings() {
	return {
		focusMin: 25,
		shortMin: 5,
		longMin: 15,
		autoStart: false,
		sound: true,
		vibrate: true,
		notify: false,
		theme: "system",
		widgetSize: "sm",
		widgetW: WIDGET_WIDTH.sm,
		widgetX: -1,
		widgetY: -1,
		rememberPlace: true
	};
}
function dayKey(now) {
	const d = new Date(now);
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${d.getFullYear()}-${m}-${day}`;
}
function createEngine(now = 0) {
	const settings = defaultSettings();
	const plannedMs = settings.focusMin * 6e4;
	return {
		kind: "focus",
		phase: "idle",
		plannedMs,
		durationMs: plannedMs,
		remainingMs: plannedMs,
		endsAt: null,
		cycleFocus: 0,
		todayKey: dayKey(now),
		todaySessions: 0,
		todayFocusMs: 0,
		totalSessions: 0,
		totalFocusMs: 0,
		onboarded: false,
		widgetOpen: false,
		settings
	};
}
function clampMinutes(kind, value) {
	const n = Math.round(Number(value));
	if (kind === "focus") {
		if (!Number.isFinite(n)) return 25;
		return Math.min(120, Math.max(1, n));
	}
	const fallback = kind === "short" ? 5 : 15;
	if (!Number.isFinite(n)) return fallback;
	return Math.min(60, Math.max(1, n));
}
function durationFor(settings, kind) {
	return clampMinutes(kind, kind === "focus" ? settings.focusMin : kind === "short" ? settings.shortMin : settings.longMin) * 6e4;
}
function formatClock(ms) {
	const total = ms <= 0 ? 0 : Math.ceil(ms / 1e3);
	const h = Math.floor(total / 3600);
	const m = Math.floor(total % 3600 / 60);
	const s = total % 60;
	const mm = String(m).padStart(2, "0");
	const ss = String(s).padStart(2, "0");
	if (h > 0) return `${h}:${mm}:${ss}`;
	return `${mm}:${ss}`;
}
function spokenTime(ms) {
	const total = ms <= 0 ? 0 : Math.ceil(ms / 1e3);
	const h = Math.floor(total / 3600);
	const m = Math.floor(total % 3600 / 60);
	const s = total % 60;
	const parts = [];
	if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
	if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
	if (s || parts.length === 0) parts.push(`${s} second${s === 1 ? "" : "s"}`);
	return parts.join(" ");
}
function kindLabel(kind) {
	if (kind === "focus") return "Focus";
	if (kind === "short") return "Short break";
	return "Long break";
}
function phaseLabel(phase) {
	if (phase === "running") return "In progress";
	if (phase === "paused") return "Paused";
	return "Ready";
}
function widgetWidthClamp(width) {
	const n = Math.round(width);
	if (!Number.isFinite(n)) return WIDGET_WIDTH.md;
	return Math.min(360, Math.max(200, n));
}
function nearestSize(width) {
	let best = "md";
	let dist = Infinity;
	for (const key of [
		"sm",
		"md",
		"lg"
	]) {
		const d = Math.abs(WIDGET_WIDTH[key] - width);
		if (d < dist) {
			dist = d;
			best = key;
		}
	}
	return best;
}
function isKind(v) {
	return v === "focus" || v === "short" || v === "long";
}
function isPhase(v) {
	return v === "idle" || v === "running" || v === "paused";
}
function isTheme(v) {
	return v === "system" || v === "light" || v === "dark";
}
function isSize(v) {
	return v === "sm" || v === "md" || v === "lg";
}
function num(v, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
	const n = typeof v === "number" ? v : Number(v);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}
function sanitize(raw, now) {
	const base = createEngine(now);
	if (!raw || typeof raw !== "object") return base;
	const r = raw;
	const rs = r.settings ?? {};
	const settings = {
		focusMin: clampMinutes("focus", rs.focusMin ?? base.settings.focusMin),
		shortMin: clampMinutes("short", rs.shortMin ?? base.settings.shortMin),
		longMin: clampMinutes("long", rs.longMin ?? base.settings.longMin),
		autoStart: Boolean(rs.autoStart),
		sound: rs.sound !== false,
		vibrate: rs.vibrate !== false,
		notify: Boolean(rs.notify),
		theme: isTheme(rs.theme) ? rs.theme : "system",
		widgetSize: isSize(rs.widgetSize) ? rs.widgetSize : "sm",
		widgetW: widgetWidthClamp(rs.widgetW ?? WIDGET_WIDTH.sm),
		widgetX: num(rs.widgetX, -1, -1, 1e4),
		widgetY: num(rs.widgetY, -1, -1, 1e4),
		rememberPlace: rs.rememberPlace !== false
	};
	const kind = isKind(r.kind) ? r.kind : "focus";
	let phase = isPhase(r.phase) ? r.phase : "idle";
	const plannedMs = num(r.plannedMs, durationFor(settings, kind), 6e4, 72e5);
	const durationMs = num(r.durationMs, plannedMs, 6e4, 72e5);
	let remainingMs = num(r.remainingMs, durationMs, 0, 72e5);
	let endsAt = typeof r.endsAt === "number" && Number.isFinite(r.endsAt) ? r.endsAt : null;
	if (phase !== "running") endsAt = null;
	if (phase === "running" && endsAt == null) endsAt = now + remainingMs;
	if (phase !== "running") remainingMs = Math.min(remainingMs, plannedMs);
	return {
		kind,
		phase,
		plannedMs,
		durationMs,
		remainingMs,
		endsAt,
		cycleFocus: Math.round(num(r.cycleFocus, 0, 0, 3)),
		todayKey: typeof r.todayKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.todayKey) ? r.todayKey : dayKey(now),
		todaySessions: Math.round(num(r.todaySessions, 0, 0, 1e6)),
		todayFocusMs: num(r.todayFocusMs, 0, 0, 0x38d7ea4c68000),
		totalSessions: Math.round(num(r.totalSessions, 0, 0, 1e9)),
		totalFocusMs: num(r.totalFocusMs, 0, 0, 0x38d7ea4c68000),
		onboarded: Boolean(r.onboarded),
		widgetOpen: Boolean(r.widgetOpen),
		settings
	};
}
function rollDay(engine, now) {
	const key = dayKey(now);
	if (engine.todayKey === key) return engine;
	return {
		...engine,
		todayKey: key,
		todaySessions: 0,
		todayFocusMs: 0
	};
}
function finishOne(engine, endedAt) {
	let cycle = engine.cycleFocus;
	let todaySessions = engine.todaySessions;
	let todayFocusMs = engine.todayFocusMs;
	let totalSessions = engine.totalSessions;
	let totalFocusMs = engine.totalFocusMs;
	if (engine.kind === "focus") {
		cycle = (cycle + 1) % 4;
		todaySessions += 1;
		todayFocusMs += engine.plannedMs;
		totalSessions += 1;
		totalFocusMs += engine.plannedMs;
	}
	const kind = engine.kind === "focus" ? cycle === 0 ? "long" : "short" : "focus";
	const plannedMs = durationFor(engine.settings, kind);
	const shared = {
		...engine,
		kind,
		plannedMs,
		durationMs: plannedMs,
		remainingMs: plannedMs,
		cycleFocus: cycle,
		todaySessions,
		todayFocusMs,
		totalSessions,
		totalFocusMs
	};
	if (engine.settings.autoStart) return {
		...shared,
		phase: "running",
		endsAt: endedAt + plannedMs
	};
	return {
		...shared,
		phase: "idle",
		endsAt: null
	};
}
function advance(engine, now) {
	let next = rollDay(engine, now);
	const finishedKinds = [];
	let lastEndedAt = null;
	while (next.phase === "running" && next.endsAt != null && now >= next.endsAt && finishedKinds.length < 48) {
		finishedKinds.push(next.kind);
		lastEndedAt = next.endsAt;
		next = finishOne(next, next.endsAt);
	}
	if (next.phase === "running" && next.endsAt != null) next = {
		...next,
		remainingMs: Math.max(0, next.endsAt - now)
	};
	return {
		engine: next,
		finishedKinds,
		lastEndedAt
	};
}
function beginRun(engine, now) {
	const base = rollDay(engine, now);
	if (base.phase === "running") return base;
	if (base.phase === "paused") {
		const left = Math.max(0, base.remainingMs);
		if (left <= 0) return advance({
			...base,
			phase: "running",
			endsAt: now,
			remainingMs: 0
		}, now).engine;
		return {
			...base,
			phase: "running",
			endsAt: now + left
		};
	}
	const planned = Math.max(6e4, base.plannedMs);
	return {
		...base,
		phase: "running",
		plannedMs: planned,
		durationMs: planned,
		remainingMs: planned,
		endsAt: now + planned
	};
}
function pauseRun(engine, now) {
	if (engine.phase !== "running" || engine.endsAt == null) return engine;
	return {
		...engine,
		phase: "paused",
		remainingMs: Math.max(0, engine.endsAt - now),
		endsAt: null
	};
}
function restartRun(engine, now) {
	const base = rollDay(engine, now);
	const planned = Math.max(6e4, base.plannedMs);
	const running = base.phase === "running";
	return {
		...base,
		phase: running ? "running" : base.phase === "paused" ? "paused" : "idle",
		plannedMs: planned,
		durationMs: planned,
		remainingMs: planned,
		endsAt: running ? now + planned : null
	};
}
function skipRun(engine, now) {
	const base = rollDay(engine, now);
	let cycle = base.cycleFocus;
	let kind;
	if (base.kind === "focus") {
		if (cycle >= 3) {
			kind = "long";
			cycle = 0;
		} else kind = "short";
	} else kind = "focus";
	const plannedMs = durationFor(base.settings, kind);
	const running = base.phase === "running";
	return {
		...base,
		kind,
		cycleFocus: cycle,
		phase: running ? "running" : "idle",
		plannedMs,
		durationMs: plannedMs,
		remainingMs: plannedMs,
		endsAt: running ? now + plannedMs : null
	};
}
function chooseKind(engine, kind, now) {
	const base = rollDay(engine, now);
	if (base.phase !== "idle") return base;
	const plannedMs = durationFor(base.settings, kind);
	return {
		...base,
		kind,
		phase: "idle",
		plannedMs,
		durationMs: plannedMs,
		remainingMs: plannedMs,
		endsAt: null
	};
}
function armFocusMinutes(engine, minutes, now) {
	const base = rollDay(engine, now);
	if (base.phase !== "idle") return base;
	const plannedMs = clampMinutes("focus", minutes) * 6e4;
	return {
		...base,
		kind: "focus",
		phase: "idle",
		plannedMs,
		durationMs: plannedMs,
		remainingMs: plannedMs,
		endsAt: null
	};
}
function setKindMinutes(engine, kind, minutes, now) {
	const base = rollDay(engine, now);
	const clamped = clampMinutes(kind, minutes);
	const key = kind === "focus" ? "focusMin" : kind === "short" ? "shortMin" : "longMin";
	const settings = {
		...base.settings,
		[key]: clamped
	};
	let next = {
		...base,
		settings
	};
	if (next.phase === "idle" && next.kind === kind) {
		const plannedMs = clamped * 6e4;
		next = {
			...next,
			plannedMs,
			durationMs: plannedMs,
			remainingMs: plannedMs,
			endsAt: null
		};
	}
	return next;
}
function completionCopy(kinds, engine) {
	if (kinds.length !== 1) return {
		title: "Timer updated",
		body: "Sessions finished while you were away."
	};
	if (kinds[0] === "focus") return {
		title: "Focus complete",
		body: engine.kind === "long" ? "Time for a long break." : "Time for a short break."
	};
	return {
		title: "Break complete",
		body: "Ready for another focus session."
	};
}
function toEngine(s) {
	return {
		kind: s.kind,
		phase: s.phase,
		plannedMs: s.plannedMs,
		durationMs: s.durationMs,
		remainingMs: s.remainingMs,
		endsAt: s.endsAt,
		cycleFocus: s.cycleFocus,
		todayKey: s.todayKey,
		todaySessions: s.todaySessions,
		todayFocusMs: s.todayFocusMs,
		totalSessions: s.totalSessions,
		totalFocusMs: s.totalFocusMs,
		onboarded: s.onboarded,
		widgetOpen: s.widgetOpen,
		settings: s.settings
	};
}
var bannerTimer = 0;
function clearBannerLater() {
	if (typeof window === "undefined") return;
	window.clearTimeout(bannerTimer);
	bannerTimer = window.setTimeout(() => {
		useFocus.setState({ banner: null });
	}, 4800);
}
function applyResult(result, now) {
	const copy = result.finishedKinds.length ? completionCopy(result.finishedKinds, result.engine) : null;
	useFocus.setState({
		...result.engine,
		hydrated: true,
		banner: copy?.body ?? null
	});
	if (!copy) return;
	const audible = result.lastEndedAt != null && now - result.lastEndedAt < 12e3;
	signalDone({
		sound: result.engine.settings.sound,
		vibrate: result.engine.settings.vibrate,
		notify: result.engine.settings.notify,
		audible,
		title: copy.title,
		body: copy.body
	});
	clearBannerLater();
}
var useFocus = create()(persist((set, get) => ({
	...createEngine(0),
	hydrated: false,
	banner: null,
	reconcile: () => {
		const now = Date.now();
		applyResult(advance(sanitize(get(), now), now), now);
		applyTheme(useFocus.getState().settings.theme);
	},
	tick: (now = Date.now()) => {
		const cur = sanitize(get(), now);
		const result = advance(cur, now);
		if (!(result.finishedKinds.length > 0 || result.engine.todayKey !== cur.todayKey || result.engine.phase !== cur.phase || result.engine.kind !== cur.kind)) return;
		applyResult(result, now);
	},
	toggleRun: () => {
		unlockAudio();
		const now = Date.now();
		const looked = advance(sanitize(get(), now), now);
		if (looked.finishedKinds.length > 0) {
			applyResult(looked, now);
			return;
		}
		set({
			...looked.engine.phase === "running" ? pauseRun(looked.engine, now) : beginRun(looked.engine, now),
			banner: null
		});
	},
	restart: () => {
		const now = Date.now();
		set({
			...restartRun(sanitize(get(), now), now),
			banner: null
		});
	},
	skip: () => {
		const now = Date.now();
		const looked = advance(sanitize(get(), now), now);
		if (looked.finishedKinds.length > 0) {
			applyResult(looked, now);
			return;
		}
		set({
			...skipRun(looked.engine, now),
			banner: null
		});
	},
	choose: (kind) => {
		const now = Date.now();
		set({ ...chooseKind(sanitize(get(), now), kind, now) });
	},
	setMinutes: (kind, minutes) => {
		const now = Date.now();
		set({ ...setKindMinutes(sanitize(get(), now), kind, minutes, now) });
	},
	armAndStart: (minutes) => {
		unlockAudio();
		const now = Date.now();
		let cur = sanitize(get(), now);
		if (cur.phase !== "idle") {
			set({ widgetOpen: true });
			return;
		}
		cur = beginRun(armFocusMinutes(cur, minutes, now), now);
		set({
			...cur,
			widgetOpen: true,
			banner: null
		});
	},
	setTheme: (theme) => {
		set((s) => ({ settings: {
			...s.settings,
			theme
		} }));
		applyTheme(theme);
	},
	setFlag: (key, value) => {
		set((s) => ({ settings: {
			...s.settings,
			[key]: value
		} }));
	},
	setNotify: async (on) => {
		const ok = on ? await requestNotify() : false;
		set((s) => ({ settings: {
			...s.settings,
			notify: ok
		} }));
	},
	setWidgetSize: (size) => {
		set((s) => ({ settings: {
			...s.settings,
			widgetSize: size,
			widgetW: WIDGET_WIDTH[size]
		} }));
	},
	commitWidget: (box) => {
		const w = widgetWidthClamp(box.w);
		set((s) => ({ settings: {
			...s.settings,
			widgetW: w,
			widgetSize: nearestSize(w),
			widgetX: s.settings.rememberPlace ? Math.round(box.x) : s.settings.widgetX,
			widgetY: s.settings.rememberPlace ? Math.round(box.y) : s.settings.widgetY
		} }));
	},
	resetWidgetPlace: () => {
		set((s) => ({ settings: {
			...s.settings,
			widgetX: -1,
			widgetY: -1
		} }));
	},
	openWidget: (run) => {
		unlockAudio();
		const now = Date.now();
		let cur = sanitize(get(), now);
		const looked = advance(cur, now);
		if (looked.finishedKinds.length > 0) {
			applyResult(looked, now);
			set({ widgetOpen: true });
			return;
		}
		cur = looked.engine;
		if (run && cur.phase !== "running") cur = beginRun(cur, now);
		set({
			...cur,
			widgetOpen: true,
			banner: null
		});
	},
	closeWidget: () => set({ widgetOpen: false }),
	finishOnboarding: () => set({ onboarded: true })
}), {
	name: "focus-store-v1",
	version: 1,
	partialize: (s) => toEngine(s),
	onRehydrateStorage: () => (state, error) => {
		if (error || !state) {
			useFocus.setState({ hydrated: true });
			return;
		}
		state.reconcile();
	}
}));
function AboutView() {
	const totalSessions = useFocus((s) => s.totalSessions);
	const totalFocusMs = useFocus((s) => s.totalFocusMs);
	const minutes = Math.round(totalFocusMs / 6e4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
					className: "size-12",
					alt: ""
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: APP_NAME
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["Version ", VERSION]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-pretty text-muted",
				children: "A calm Pomodoro timer for study and deep work, with a floating card that keeps the countdown in sight."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: totalSessions === 0 ? "No focus sessions recorded yet." : `${totalSessions} focus session${totalSessions === 1 ? "" : "s"} · ${minutes} minutes on this device.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "sr-only",
						children: "Studio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "border-b border-line py-4 text-sm",
						children: ["Created and crafted by ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-fg",
							children: STUDIO
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "flex items-center gap-3 border-b border-line py-4",
						href: `mailto:${EMAIL}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
							className: "size-4 text-brand",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm text-muted",
							children: EMAIL
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "flex items-center gap-3 py-4",
						href: SITE,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
							className: "size-4 text-brand",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: "Website"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm text-muted",
							children: SITE_LABEL
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex gap-3 text-sm text-pretty text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
					className: "mt-0.5 size-4 shrink-0 text-brand",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Timer, settings, and history stay on this device. No account, no ads, and no network required to run a session." })]
			})
		]
	});
}
var NowContext = (0, import_react.createContext)(0);
function useNow() {
	return (0, import_react.useContext)(NowContext);
}
function ClockProvider({ children }) {
	const phase = useFocus((s) => s.phase);
	const endsAt = useFocus((s) => s.endsAt);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const catchUp = () => {
			const n = Date.now();
			setNow(n);
			useFocus.getState().tick(n);
		};
		document.addEventListener("visibilitychange", catchUp);
		window.addEventListener("pageshow", catchUp);
		return () => {
			document.removeEventListener("visibilitychange", catchUp);
			window.removeEventListener("pageshow", catchUp);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (phase !== "running" || endsAt == null) return;
		let timer = 0;
		let dead = false;
		const fire = () => {
			if (dead) return;
			const n = Date.now();
			setNow(n);
			const state = useFocus.getState();
			const before = state.endsAt;
			if (state.phase === "running" && before != null && n >= before - 20) {
				state.tick(n);
				const after = useFocus.getState();
				if (after.phase !== "running" || after.endsAt == null || after.endsAt !== before) return;
			}
			const mod = ((state.endsAt ?? n) - n) % 1e3;
			timer = window.setTimeout(fire, mod <= 40 ? 1e3 : mod);
		};
		fire();
		return () => {
			dead = true;
			window.clearTimeout(timer);
		};
	}, [phase, endsAt]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowContext.Provider, {
		value: now,
		children
	});
}
function SessionMark({ kind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-1.5 rounded-full bg-mark",
			"aria-hidden": "true"
		}), kindLabel(kind)]
	});
}
function ProgressRing({ progress, children }) {
	const id = (0, import_react.useId)();
	const r = 46;
	const c = 2 * Math.PI * r;
	const offset = c * (1 - Math.min(1, Math.max(0, progress)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto grid w-72 max-w-full place-items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 120 120",
			className: "w-full",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id,
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "var(--brand-a)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "var(--brand-b)"
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "60",
					cy: "60",
					r,
					fill: "none",
					stroke: "var(--line)",
					strokeWidth: "6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "60",
					cy: "60",
					r,
					fill: "none",
					stroke: `url(#${id})`,
					strokeWidth: "6",
					strokeLinecap: "round",
					strokeDasharray: c,
					strokeDashoffset: offset,
					transform: "rotate(-90 60 60)",
					style: { transition: "stroke-dashoffset 200ms linear" }
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 grid place-items-center px-8 text-center",
			children
		})]
	});
}
function Meter({ progress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 overflow-hidden rounded-full bg-chip",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-brand",
			style: {
				width: `${Math.round(progress * 100)}%`,
				transition: "width 200ms linear"
			}
		})
	});
}
function Banner({ message }) {
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		className: "rounded-2xl bg-soft px-4 py-3 text-center text-sm text-fg",
		children: message
	});
}
function statusLine(kind, phase, left) {
	return `${kindLabel(kind)}. ${spokenTime(left)} remaining. ${phaseLabel(phase)}.`;
}
function longHint(kind, cycleFocus) {
	if (kind === "long") return "A longer rest";
	if (kind === "short") return "A short rest";
	const left = 4 - cycleFocus;
	if (left <= 1) return "Long break is next";
	return `Long break in ${left} focus sessions`;
}
function pipApi() {
	if (typeof window === "undefined") return null;
	return window.documentPictureInPicture ?? null;
}
function pipSupported() {
	return pipApi() != null;
}
var pipWindow = null;
var PIP_CSS = `
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
`;
function paint(doc) {
	const s = useFocus.getState();
	const now = Date.now();
	const left = s.phase === "running" && s.endsAt != null ? Math.max(0, s.endsAt - now) : s.remainingMs;
	const time = doc.getElementById("pip-time");
	const kind = doc.getElementById("pip-kind");
	const go = doc.getElementById("pip-go");
	if (time) time.textContent = formatClock(left);
	if (kind) kind.textContent = kindLabel(s.kind);
	if (go) {
		const label = labelFor(s.phase);
		go.textContent = label;
		go.setAttribute("aria-label", label);
	}
}
function labelFor(phase) {
	if (phase === "running") return "Pause";
	if (phase === "paused") return "Resume";
	return "Start";
}
async function openPip() {
	const api = pipApi();
	if (!api) return "unsupported";
	try {
		if (pipWindow && !pipWindow.closed) {
			pipWindow.focus();
			return "ok";
		}
		const win = await api.requestWindow({
			width: 300,
			height: 180
		});
		pipWindow = win;
		const doc = win.document;
		doc.title = "Focus";
		const style = doc.createElement("style");
		style.textContent = PIP_CSS;
		doc.head.appendChild(style);
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
      </div>`;
		doc.getElementById("pip-go")?.addEventListener("click", () => useFocus.getState().toggleRun());
		doc.getElementById("pip-close")?.addEventListener("click", () => win.close());
		paint(doc);
		const unsub = useFocus.subscribe(() => paint(doc));
		const timer = win.setInterval(() => paint(doc), 1e3);
		const cleanup = () => {
			unsub();
			win.clearInterval(timer);
			if (pipWindow === win) pipWindow = null;
		};
		win.addEventListener("pagehide", cleanup);
		return "ok";
	} catch {
		return "blocked";
	}
}
function HomeView({ onSettings, onCustom }) {
	const now = useNow();
	const kind = useFocus((s) => s.kind);
	const phase = useFocus((s) => s.phase);
	const plannedMs = useFocus((s) => s.plannedMs);
	const remainingMs = useFocus((s) => s.remainingMs);
	const endsAt = useFocus((s) => s.endsAt);
	const widgetOpen = useFocus((s) => s.widgetOpen);
	const banner = useFocus((s) => s.banner);
	const todaySessions = useFocus((s) => s.todaySessions);
	const todayFocusMs = useFocus((s) => s.todayFocusMs);
	const openWidget = useFocus((s) => s.openWidget);
	const closeWidget = useFocus((s) => s.closeWidget);
	const armAndStart = useFocus((s) => s.armAndStart);
	const [pipReady, setPipReady] = (0, import_react.useState)(false);
	const [pipNote, setPipNote] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setPipReady(pipSupported());
	}, []);
	const left = phase === "running" && endsAt != null ? Math.max(0, endsAt - now) : remainingMs;
	const progress = plannedMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - left / plannedMs));
	const minutesToday = Math.round(todayFocusMs / 6e4);
	const running = phase === "running";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
						className: "size-7",
						alt: ""
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-muted uppercase",
						children: "DYPOL LABS"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": "Settings",
					onClick: onSettings,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-semibold tracking-tight",
				children: "Focus"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-pretty text-muted",
				children: "Stay focused. Keep your timer within reach."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface grid gap-5 p-5",
				"aria-label": "Current session",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionMark, { kind }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: phaseLabel(phase)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "clock text-6xl",
						"data-testid": "clock",
						"aria-hidden": "true",
						children: formatClock(left)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sr-only",
						children: statusLine(kind, phase, left)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { progress }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: todaySessions === 0 ? "No focus sessions yet today" : `Today · ${todaySessions} session${todaySessions === 1 ? "" : "s"} · ${minutesToday} min`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banner, { message: banner }),
			widgetOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "brand-btn w-full",
				onClick: closeWidget,
				"data-testid": "float-toggle",
				children: "Hide floating widget"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "brand-btn w-full",
				onClick: () => openWidget(true),
				"data-testid": "float-toggle",
				children: "Start floating widget"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Floating card: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-fg",
					children: widgetOpen ? "On" : "Off"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-semibold tracking-widest text-muted uppercase",
					children: "Quick start"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "quiet-btn",
							disabled: running,
							onClick: () => armAndStart(25),
							children: "25 min"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "quiet-btn",
							disabled: running,
							onClick: () => armAndStart(50),
							children: "50 min"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "quiet-btn",
							disabled: running,
							onClick: onCustom,
							children: "Custom"
						})
					]
				}),
				running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Length changes apply after this session."
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					pipReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "quiet-btn w-full",
						onClick: () => {
							openPip().then((result) => {
								if (result === "blocked") setPipNote("The browser blocked the floating window.");
								else setPipNote(null);
							});
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Pin above other windows"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-pretty text-muted",
						children: "The card floats over Focus while you use the timer. In Chrome, you can also pin it above other windows. Closing it never resets the session."
					}),
					pipNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: pipNote
					}) : null
				]
			})
		]
	});
}
var ITEMS = [
	{
		id: "home",
		label: "Home",
		icon: House
	},
	{
		id: "timer",
		label: "Timer",
		icon: Timer
	},
	{
		id: "about",
		label: "About",
		icon: Info
	}
];
function NavBar({ tab, onTab }) {
	const index = Math.max(0, ITEMS.findIndex((item) => item.id === tab));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Primary",
		className: "fixed bottom-safe left-1/2 z-30 nav-width -translate-x-1/2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "nav-shell relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "nav-indicator",
				"data-i": String(index),
				"aria-hidden": "true"
			}), ITEMS.map((item) => {
				const Icon = item.icon;
				const current = tab === item.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "nav-item",
					"aria-current": current ? "page" : void 0,
					onClick: () => onTab(item.id),
					"data-testid": `nav-${item.id}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						strokeWidth: current ? 2.4 : 1.8,
						"aria-hidden": "true"
					}), item.label]
				}, item.id);
			})]
		})
	});
}
var POINTS = [
	{
		n: "01",
		title: "Work in intervals",
		body: "Focus for a set time, then rest. After four focus sessions, take a longer break."
	},
	{
		n: "02",
		title: "Time that stays honest",
		body: "The countdown follows the clock. Leave and come back, and Focus catches up."
	},
	{
		n: "03",
		title: "A card that stays near",
		body: "Open the floating timer, drag it, and resize it. Closing the card does not reset your session."
	}
];
function Onboarding() {
	const finish = useFocus((s) => s.finishOnboarding);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-safe pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
					className: "size-10",
					alt: ""
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-muted uppercase",
					children: "DYPOL LABS"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-10 text-4xl font-semibold tracking-tight text-balance",
				children: "Stay with the work."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base text-pretty text-muted",
				children: "A private Pomodoro timer. Nothing leaves this device."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-8 divide-y divide-line",
				children: POINTS.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[2.5rem_1fr] gap-3 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pt-0.5 text-sm font-semibold text-brand",
						children: point.n
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: point.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-pretty text-muted",
						children: point.body
					})] })]
				}, point.n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-auto pt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "brand-btn w-full",
					onClick: finish,
					"data-testid": "begin",
					children: "Begin"
				})
			})
		]
	});
}
function SettingsSheet({ open, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-black/45" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "surface fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-b-none p-5 pb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-xl font-semibold",
						children: "Settings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
						className: "icon-btn",
						"aria-label": "Close settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-4",
							"aria-hidden": "true"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "sr-only",
					children: "Timer, alerts, appearance, and floating widget."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsForm, {})
			]
		})] })
	});
}
function SettingsForm() {
	const settings = useFocus((s) => s.settings);
	const phase = useFocus((s) => s.phase);
	const kind = useFocus((s) => s.kind);
	const setMinutes = useFocus((s) => s.setMinutes);
	const setTheme = useFocus((s) => s.setTheme);
	const setFlag = useFocus((s) => s.setFlag);
	const setNotify = useFocus((s) => s.setNotify);
	const setWidgetSize = useFocus((s) => s.setWidgetSize);
	const resetWidgetPlace = useFocus((s) => s.resetWidgetPlace);
	const [notifyHint, setNotifyHint] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Timer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minutes, {
						label: "Focus",
						kind: "focus",
						min: 1,
						max: 120,
						value: settings.focusMin,
						pending: phase === "running" && kind === "focus",
						onChange: (n) => setMinutes("focus", n)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minutes, {
						label: "Short break",
						kind: "short",
						min: 1,
						max: 60,
						value: settings.shortMin,
						pending: phase === "running" && kind === "short",
						onChange: (n) => setMinutes("short", n)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minutes, {
						label: "Long break",
						kind: "long",
						min: 1,
						max: 60,
						value: settings.longMin,
						pending: phase === "running" && kind === "long",
						onChange: (n) => setMinutes("long", n)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Auto-start next session",
						hint: "Starts the next session when one ends.",
						on: settings.autoStart,
						onChange: (v) => setFlag("autoStart", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Alerts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Sound",
						on: settings.sound,
						onChange: (v) => setFlag("sound", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Vibration",
						on: settings.vibrate,
						onChange: (v) => setFlag("vibrate", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Notify when a session ends",
						hint: notifyHint ?? "Shown if Focus is in the background.",
						on: settings.notify,
						onChange: (v) => {
							setNotify(v).then(() => {
								if (v && typeof Notification !== "undefined" && Notification.permission === "denied") setNotifyHint("Notifications are blocked in the browser.");
								else setNotifyHint(null);
							});
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Appearance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					role: "group",
					"aria-label": "Theme",
					children: [
						["system", "System"],
						["light", "Light"],
						["dark", "Dark"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "chip",
						"aria-pressed": settings.theme === id,
						onClick: () => setTheme(id),
						children: label
					}, id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Floating widget"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						role: "group",
						"aria-label": "Widget size",
						children: [
							["sm", "Small"],
							["md", "Medium"],
							["lg", "Large"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "chip",
							"aria-pressed": settings.widgetSize === id,
							onClick: () => setWidgetSize(id),
							children: label
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Remember position",
						on: settings.rememberPlace,
						onChange: (v) => setFlag("rememberPlace", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "quiet-btn",
						onClick: resetWidgetPlace,
						children: "Reset position"
					})
				]
			})
		]
	});
}
function Minutes({ label, kind, min, max, value, pending, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "clock text-sm",
					children: [value, " min"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "range",
				type: "range",
				min,
				max,
				step: 1,
				value,
				"aria-label": `${label} minutes`,
				"aria-valuetext": `${value} minutes`,
				onChange: (e) => onChange(Number(e.target.value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted",
				children: [
					min,
					"–",
					max,
					" min",
					pending ? " · applies to the next session" : "",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "sr-only",
						children: [" for ", kind]
					})
				]
			})
		]
	});
}
function Toggle({ label, hint, on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "switch",
		"aria-checked": on,
		onClick: () => onChange(!on),
		className: "flex min-h-11 items-center justify-between gap-4 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-medium",
			children: label
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs text-muted",
			children: hint
		}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative h-7 w-12 shrink-0 rounded-full ${on ? "bg-brand" : "bg-chip"}`,
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `absolute top-0.5 left-0.5 size-6 rounded-full bg-card shadow-card ${on ? "translate-x-5" : ""}`,
				style: { transition: "transform 160ms ease" }
			})
		})]
	});
}
function CustomDialog({ open, onOpenChange }) {
	const focusMin = useFocus((s) => s.settings.focusMin);
	const phase = useFocus((s) => s.phase);
	const armAndStart = useFocus((s) => s.armAndStart);
	const [mins, setMins] = (0, import_react.useState)(focusMin);
	(0, import_react.useEffect)(() => {
		if (open) setMins(focusMin);
	}, [open, focusMin]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-black/45" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "surface fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,22rem)] -translate-x-1/2 -translate-y-1/2 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-lg font-semibold",
					children: "Custom focus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-1 text-sm text-muted",
					children: "Choose a length from 1 to 120 minutes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "clock mt-5 text-center text-5xl",
					children: mins
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-center text-sm text-muted",
					children: "minutes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "range",
					type: "range",
					min: 1,
					max: 120,
					value: mins,
					"aria-label": "Focus minutes",
					onChange: (e) => setMins(Number(e.target.value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "brand-btn mt-5 w-full",
					disabled: phase !== "idle",
					onClick: () => {
						armAndStart(mins);
						onOpenChange(false);
					},
					children: phase === "idle" ? "Start focus" : "Session already running"
				})
			]
		})] })
	});
}
var KINDS = [
	"focus",
	"short",
	"long"
];
function TimerView({ onSettings }) {
	const now = useNow();
	const kind = useFocus((s) => s.kind);
	const phase = useFocus((s) => s.phase);
	const plannedMs = useFocus((s) => s.plannedMs);
	const remainingMs = useFocus((s) => s.remainingMs);
	const endsAt = useFocus((s) => s.endsAt);
	const cycleFocus = useFocus((s) => s.cycleFocus);
	const todaySessions = useFocus((s) => s.todaySessions);
	const banner = useFocus((s) => s.banner);
	const toggleRun = useFocus((s) => s.toggleRun);
	const restart = useFocus((s) => s.restart);
	const skip = useFocus((s) => s.skip);
	const choose = useFocus((s) => s.choose);
	const left = phase === "running" && endsAt != null ? Math.max(0, endsAt - now) : remainingMs;
	const progress = plannedMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - left / plannedMs));
	const primary = phase === "running" ? "Pause" : phase === "paused" ? "Resume" : "Start";
	const Icon = phase === "running" ? Pause : Play;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "sr-only",
						children: "Timer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						role: "group",
						"aria-label": "Session type",
						children: KINDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "chip",
							"aria-pressed": kind === item,
							disabled: phase !== "idle",
							onClick: () => choose(item),
							children: kindLabel(item)
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn shrink-0",
						"aria-label": "Settings",
						onClick: onSettings,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
							className: "size-5",
							"aria-hidden": "true"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid justify-items-center gap-4",
				"aria-label": "Countdown",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionMark, { kind }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRing, {
						progress,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "clock text-5xl",
							"data-testid": "clock",
							"aria-hidden": "true",
							children: formatClock(left)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: primary === "Start" ? "Ready" : primary === "Pause" ? "In progress" : "Paused"
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sr-only",
						children: statusLine(kind, phase, left)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banner, { message: banner }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "brand-btn w-full",
					onClick: toggleRun,
					"data-testid": "primary-action",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						"aria-hidden": "true"
					}), primary]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "quiet-btn",
						onClick: restart,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Restart"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "quiet-btn",
						onClick: skip,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Skip"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted",
				children: [
					longHint(kind, cycleFocus),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: " · "
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						todaySessions,
						" focus session",
						todaySessions === 1 ? "" : "s",
						" today"
					] })
				]
			})
		]
	});
}
function clamp(x, y, w, h, vw, vh) {
	const m = 8;
	return {
		x: Math.min(Math.max(m, x), Math.max(m, vw - w - m)),
		y: Math.min(Math.max(m, y), Math.max(m, vh - h - m))
	};
}
function place(width, x, y, remember) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const guess = 96;
	if (remember && x >= 0 && y >= 0) return {
		...clamp(x, y, width, guess, vw, vh),
		w: width
	};
	return {
		...clamp(vw - width - 12, 16, width, guess, vw, vh),
		w: width
	};
}
function FloatingWidget() {
	if (!useFocus((s) => s.widgetOpen)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetBody, {});
}
function WidgetBody() {
	const now = useNow();
	const kind = useFocus((s) => s.kind);
	const phase = useFocus((s) => s.phase);
	const plannedMs = useFocus((s) => s.plannedMs);
	const remainingMs = useFocus((s) => s.remainingMs);
	const endsAt = useFocus((s) => s.endsAt);
	const settings = useFocus((s) => s.settings);
	const toggleRun = useFocus((s) => s.toggleRun);
	const restart = useFocus((s) => s.restart);
	const skip = useFocus((s) => s.skip);
	const closeWidget = useFocus((s) => s.closeWidget);
	const commitWidget = useFocus((s) => s.commitWidget);
	const [box, setBox] = (0, import_react.useState)(() => place(settings.widgetW, settings.widgetX, settings.widgetY, settings.rememberPlace));
	const [vp, setVp] = (0, import_react.useState)(() => ({
		w: window.innerWidth,
		h: window.innerHeight
	}));
	const drag = (0, import_react.useRef)(null);
	const ref = (0, import_react.useRef)(null);
	const boxRef = (0, import_react.useRef)(box);
	boxRef.current = box;
	const seenX = (0, import_react.useRef)(settings.widgetX);
	(0, import_react.useEffect)(() => {
		const onResize = () => setVp({
			w: window.innerWidth,
			h: window.innerHeight
		});
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	(0, import_react.useEffect)(() => {
		if (drag.current) return;
		const h = ref.current?.offsetHeight ?? 148;
		const reset = settings.widgetX < 0 && seenX.current >= 0;
		seenX.current = settings.widgetX;
		setBox((cur) => {
			const w = settings.widgetW;
			if (reset) {
				const fallback = place(w, -1, -1, false);
				return {
					...clamp(fallback.x, fallback.y, w, h, vp.w, vp.h),
					w
				};
			}
			return {
				...clamp(cur.x, cur.y, w, h, vp.w, vp.h),
				w
			};
		});
	}, [
		settings.widgetW,
		settings.widgetX,
		vp.w,
		vp.h
	]);
	const left = phase === "running" && endsAt != null ? Math.max(0, endsAt - now) : remainingMs;
	const progress = plannedMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - left / plannedMs));
	const roomy = box.w >= 300;
	const labeled = box.w >= 248;
	const primary = phase === "running" ? "Pause" : phase === "paused" ? "Resume" : "Start";
	const Icon = phase === "running" ? Pause : Play;
	function onPointerDown(e) {
		if (e.target.closest("[data-nodrag]")) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		drag.current = {
			id: e.pointerId,
			mode: "move",
			dx: e.clientX - box.x,
			dy: e.clientY - box.y
		};
	}
	function onResizeDown(e) {
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);
		drag.current = {
			id: e.pointerId,
			mode: "resize",
			originX: e.clientX,
			startW: box.w
		};
	}
	function onPointerMove(e) {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		const h = ref.current?.offsetHeight ?? 148;
		if (d.mode === "move") {
			const c = clamp(e.clientX - d.dx, e.clientY - d.dy, boxRef.current.w, h, window.innerWidth, window.innerHeight);
			setBox({
				...c,
				w: boxRef.current.w
			});
		} else {
			const w = Math.min(360, Math.max(200, Math.round(d.startW + (e.clientX - d.originX))));
			const c = clamp(boxRef.current.x, boxRef.current.y, w, h, window.innerWidth, window.innerHeight);
			setBox({
				...c,
				w
			});
		}
	}
	function onPointerUp(e) {
		if (!drag.current || drag.current.id !== e.pointerId) return;
		drag.current = null;
		commitWidget(boxRef.current);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "surface fixed z-40 touch-none select-none",
		style: {
			left: box.x,
			top: box.y,
			width: box.w,
			borderRadius: "1.75rem"
		},
		"data-testid": "widget",
		role: "region",
		"aria-label": "Floating focus timer",
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onPointerUp,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 overflow-hidden rounded-t-[1.7rem] bg-chip",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-brand",
					style: { width: `${Math.round(progress * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: labeled ? "grid gap-2 p-3" : "flex items-center gap-2 px-3 py-2.5",
				children: [
					labeled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-muted uppercase",
							children: kindLabel(kind)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn size-11",
							"data-nodrag": true,
							"aria-label": "Close floating widget",
							onClick: closeWidget,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "size-4",
								"aria-hidden": "true"
							})
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `clock ${labeled ? "text-4xl" : "min-w-0 flex-1 text-2xl"}`,
						"aria-hidden": "true",
						children: formatClock(left)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: labeled ? "flex gap-2" : "flex gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn size-11 bg-brand text-on-brand border-0",
								"data-nodrag": true,
								"aria-label": primary,
								onClick: toggleRun,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									"aria-hidden": "true"
								})
							}),
							roomy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn size-11",
								"data-nodrag": true,
								"aria-label": "Restart",
								onClick: restart,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									className: "size-4",
									"aria-hidden": "true"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn size-11",
								"data-nodrag": true,
								"aria-label": "Skip",
								onClick: skip,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})] }) : null,
							labeled ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn size-11",
								"data-nodrag": true,
								"aria-label": "Close floating widget",
								onClick: closeWidget,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": "Resize floating timer",
				className: "absolute right-1.5 bottom-1.5 grid size-8 place-items-center text-muted",
				onPointerDown: onResizeDown,
				onPointerMove,
				onPointerUp,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block size-2.5 rounded-sm border-r-2 border-b-2 border-current" })
			})
		]
	});
}
function FocusApp() {
	const hydrated = useFocus((s) => s.hydrated);
	const onboarded = useFocus((s) => s.onboarded);
	const theme = useFocus((s) => s.settings.theme);
	const phase = useFocus((s) => s.phase);
	const widgetOpen = useFocus((s) => s.widgetOpen);
	const widgetX = useFocus((s) => s.settings.widgetX);
	const widgetW = useFocus((s) => s.settings.widgetW);
	const [tab, setTab] = (0, import_react.useState)("home");
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [customOpen, setCustomOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!useFocus.persist.hasHydrated()) useFocus.persist.rehydrate();
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		if (!hydrated) {
			const stored = localStorage.getItem("focus-theme");
			if (stored === "light" || stored === "dark" || stored === "system") applyTheme(stored);
			else applyTheme("system");
			return;
		}
		applyTheme(theme);
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [theme, hydrated]);
	(0, import_react.useEffect)(() => {
		let lock = null;
		let dead = false;
		const acquire = () => {
			if (dead || phase !== "running" || !("wakeLock" in navigator)) return;
			navigator.wakeLock.request("screen").then((sent) => {
				if (dead) sent.release();
				else lock = sent;
			}).catch(() => {});
		};
		const onVis = () => {
			if (document.visibilityState === "visible") acquire();
		};
		acquire();
		document.addEventListener("visibilitychange", onVis);
		return () => {
			dead = true;
			document.removeEventListener("visibilitychange", onVis);
			lock?.release().catch(() => {});
		};
	}, [phase]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid justify-items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
				className: "size-10",
				alt: "DYPOL LABS"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Focus"
			})]
		})
	});
	if (!onboarded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ClockProvider, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: `mx-auto min-h-dvh w-full max-w-md px-5 pb-safe-nav ${!(widgetOpen && widgetX < 0) ? "pt-safe" : widgetW >= 300 ? "pt-64" : widgetW >= 248 ? "pt-52" : "pt-32"}`,
			children: [
				tab === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {
					onSettings: () => setSettingsOpen(true),
					onCustom: () => setCustomOpen(true)
				}) : null,
				tab === "timer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimerView, { onSettings: () => setSettingsOpen(true) }) : null,
				tab === "about" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AboutView, {}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavBar, {
			tab,
			onTab: setTab
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingWidget, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {
			open: settingsOpen,
			onOpenChange: setSettingsOpen
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomDialog, {
			open: customOpen,
			onOpenChange: setCustomOpen
		})
	] });
}
var SplitComponent = FocusApp;
//#endregion
export { SplitComponent as component };
