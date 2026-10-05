DymeR is an offline Pomodoro timer made by DYPOL LABS for study and deep work. It is an Android app, package name `com.dymer.dypol`, version 1.1.0. It runs entirely on the phone. There is no account, no sign-in, no ads, and no internet connection required to start or finish a session. Durations, theme, stats, and the floating timer’s position stay on the device.

The idea is simple. You work for a set stretch, then rest. After four focus sessions, the next rest is a longer break. The countdown is tied to the clock, not to a fragile second-by-second counter, so if you leave DymeR and come back the remaining time is still correct.

## How a session works

A session is one of three kinds: Focus, Short break, or Long break. The defaults are 25 minutes of focus, 5 minutes of short break, and 15 minutes of long break. Focus can be set from 1 to 120 minutes. Breaks can be set from 1 to 60 minutes.

The timer has three states. Ready means nothing is running and you can change the session type or the length. In progress means the clock is counting down. Paused means the remaining time is held until you resume.

When a focus session finishes, DymeR moves you to a short break. The fourth finished focus session in the cycle earns a long break instead, and the cycle then starts again. If Auto-start is on, the next session begins by itself. If it is off, the app waits for you to press Start. Skip moves you on without counting that focus block as a completed session. Restart puts the current block back to its full length. If you change a duration while that kind of session is already running, the new length waits for the next session and does not cut the one you are in.

If a session ends while you are away, DymeR catches up from the real clock when you return. Several sessions can finish in a row if Auto-start is on and you were gone for a long time. Today’s counts reset when the date changes. The all-time total does not.

## Screens

Home shows the DYPOL LABS mark, the current session, a large clock, a progress bar, and how many focus sessions and minutes you have done today. From here you can open Settings, start the floating timer, or quick-start 25 minutes, 50 minutes, or a custom length. A custom length is any focus from 1 to 120 minutes. Quick start will not replace a session that is already running.

Timer is the full countdown. Chips switch between Focus, Short break, and Long break, but only while the timer is ready. A ring shows progress. The main button is Start, Pause, or Resume. Restart and Skip sit underneath.

About shows the app name, version 1.1.0, a short explanation, and the totals saved on this phone. It credits DYPOL LABS, lists the studio email `dypollabs@protonmail.com`, and the site `dypol.vercel.app`. It also states that nothing has to leave the device for a session to run.

The first launch is a short introduction: work in intervals, trust the clock, and use the floating card. After that, a bar at the bottom switches between Home, Timer, and About.

Settings holds the rest of the controls. Timer lengths are sliders. Alerts are switches for sound, vibration, and a notification when a session ends. Appearance is System, Light, or Dark. The floating-timer section has Small, Medium, and Large presets, Remember position, Reset position, and Transparency.

## Look and fit

The app uses a warm paper background, dark red text, and a red-to-pink gradient on the main buttons. Dark mode uses the same gradient on a near-black background. System follows the phone. The DYPOL LABS mark stays small in the header and a little larger on About and the opening screen.

Type, icons, chips, and buttons are sized from the same scale. That scale follows the width of the screen and the phone’s font size, so a small phone and a large phone do not get a layout where the words grow and the icons stay tiny, or the opposite. The column stays readable instead of stretching edge to edge on a wide screen. The countdown itself also grows and shrinks with the width.

## The floating timer

The floating timer is a separate bubble drawn above other apps. It is not just a card inside DymeR. You turn it on from Home with Start floating widget. Starting a quick timer also opens it. Android will ask once for permission to display over other apps. That permission belongs to DymeR. If you still have the older Focus install, its permission does not count, because this is a different app.

After permission is allowed, DymeR does not send you back to that settings screen every time you start, pause, or reopen a timer. It only opens the permission page when the bubble truly cannot be shown.

The bubble shows the session name, the remaining time, Pause or Resume, and a close mark. Drag the time itself to move the bubble. Movement is free: left, right, up, down, or diagonal. The corner handle resizes it the same way. Pull sideways to change width, up or down to change height, or diagonally to change both at once. The label, the clock, and the buttons grow and shrink with the box so it does not turn into a tiny control in a large frame, or the reverse. Size and place are kept, including the Small, Medium, and Large presets.

Transparency is in Settings, from 0% to 60%. Zero is a solid card. Higher values make the red background more see-through so you can still read what is behind it. The text stays clearer than the background.

Closing the bubble does not reset the session. The countdown continues inside DymeR. Pressing Home, or leaving DymeR sitting in Recents, does not remove the bubble. It keeps its own clock and a quiet ongoing notification so the system does not treat it as a forgotten window. Open DymeR again from that notification or from the launcher and the timer matches the bubble. Swiping the bubble’s close mark is what hides it.

## What is stored on the phone

DymeR remembers whether you finished the introduction, the three durations, auto-start, sound, vibration, notifications, theme, widget size, widget position, transparency, whether the bubble was open, and the session in progress, including when it is due to end. It also stores today’s session count and focus minutes, and the lifetime totals. None of that is sent to an account. Uninstalling the app clears it.

## Alerts

Sound and vibration are on by default. The end-of-session notification is off until you turn it on. The phone may also ask for notification permission so the ongoing floating-timer notice, and the “session ended” notice, can appear. The floating-timer notice is silent and stays while the bubble is on screen. It shows the session name and the time left.

## What 1.1.0 fixed

The first build did not adapt to the phone. Text, icons, and options kept a rigid size, so on some screens the words and the controls no longer matched. 1.1.0 scales them together from the screen width and the system font setting, and stops the Web view from enlarging text by itself.

Permission was the second bug. After Display over other apps was already allowed, starting a timer, or opening the app again, still jumped back to that permission page. The check was wrong, so the app believed the permission was missing. 1.1.0 checks the real permission, tries to show the bubble first, and opens Settings only if Android actually rejects the window. Returning to the app after you have allowed it does not ask again.

The third bug was resize. The handle only changed width, or the layout only flipped between a horizontal bar and a vertical stack. It did not follow a diagonal drag. 1.1.0 changes width and height from the same gesture, smoothly, and scales the clock and buttons to the new box.

The fourth bug was the one that made the bubble feel pointless. Minimizing DymeR, or leaving it with the Home or Back button while it was still in Recents, removed the floating timer. What you had been seeing was tied to the open screen, so it vanished as soon as that screen was covered. 1.1.0 draws the bubble as its own overlay, kept alive on purpose, so it remains above other apps until you close the bubble itself.

Transparency was not in the first build. 1.1.0 adds it under Settings, on the floating timer, from fully solid to 60 percent transparent.

The app was also renamed. The launcher name is DymeR. The package is `com.dymer.dypol`. It installs beside the older Focus app instead of replacing it. Because it is a new package, Android asks for Display over other apps again, once, for DymeR.
