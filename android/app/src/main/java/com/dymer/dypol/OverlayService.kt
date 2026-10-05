package com.dymer.dypol

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

class OverlayService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var windowManager: WindowManager? = null
    private var root: android.view.View? = null
    private var params: WindowManager.LayoutParams? = null
    private var phase = "idle"
    private var label = "Focus"
    private var left = 0L
    private var endsAt = 0L
    private var opacity = 1f
    private var gesturing = false
    private var pendingW = 0
    private var pendingH = 0
    private val tick = object : Runnable {
        override fun run() {
            render()
            handler.postDelayed(this, 250)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val json = intent?.getStringExtra(EXTRA_STATE) ?: prefs(this).getString(KEY_STATE, null)
        val ask = intent?.getBooleanExtra(EXTRA_ASK, false) == true
        val time = format(remaining(System.currentTimeMillis()))
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTE_ID, notification(time), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            } else {
                startForeground(NOTE_ID, notification(time))
            }
        } catch (_: Exception) {
            stopSelf()
            return START_NOT_STICKY
        }
        if (json != null) apply(json)
        if (!attach()) {
            if (ask) openSettings()
            if (root == null) {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
        }
        handler.removeCallbacks(tick)
        handler.post(tick)
        return START_STICKY
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() {
        handler.removeCallbacks(tick)
        detach()
        prefs(this).edit().putBoolean(KEY_VISIBLE, false).apply()
        if (instance === this) instance = null
        super.onDestroy()
    }

    private fun apply(json: String) {
        val obj = try {
            JSONObject(json)
        } catch (_: Exception) {
            return
        }
        phase = obj.optString("phase", "idle")
        label = obj.optString("label", "Focus")
        left = obj.optLong("left", 0)
        endsAt = if (obj.isNull("endsAt")) 0L else obj.optLong("endsAt", 0)
        if (obj.has("opacity")) {
            opacity = obj.optDouble("opacity", 1.0).toFloat().coerceIn(0.35f, 1f)
        }
        if (obj.has("w") && obj.has("h")) {
            val d = resources.displayMetrics.density
            pendingW = (obj.optDouble("w") * d.toDouble()).roundToInt()
            pendingH = (obj.optDouble("h") * d.toDouble()).roundToInt()
        }
        writeState()
        if (!gesturing && root != null && pendingW > 0 && pendingH > 0) resizeTo(pendingW, pendingH)
        applyOpacity()
        render()
    }

    private fun remaining(now: Long): Long {
        if (phase == "running" && endsAt > 0) return (endsAt - now).coerceAtLeast(0)
        return left.coerceAtLeast(0)
    }

    private fun render() {
        val now = System.currentTimeMillis()
        val text = format(remaining(now))
        root?.findViewById<TextView>(R.id.overlay_time)?.text = text
        root?.findViewById<TextView>(R.id.overlay_label)?.text = label
        root?.findViewById<TextView>(R.id.overlay_toggle)?.text =
            if (phase == "running") getString(R.string.overlay_pause) else getString(R.string.overlay_resume)
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTE_ID, notification(text))
    }

    private fun attach(): Boolean {
        if (root != null) return true
        val wm = getSystemService(WindowManager::class.java)
        windowManager = wm
        val view = LayoutInflater.from(this).inflate(R.layout.overlay_timer, null)
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }
        val d = resources.displayMetrics.density
        val stored = prefs(this)
        val width = if (pendingW > 0) pendingW else stored.getInt(KEY_W, (280f * d).roundToInt())
        val height = if (pendingH > 0) pendingH else stored.getInt(KEY_H, (136f * d).roundToInt())
        val lp = WindowManager.LayoutParams(
            width,
            height,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            PixelFormat.TRANSLUCENT,
        )
        lp.gravity = Gravity.TOP or Gravity.START
        lp.x = stored.getInt(KEY_X, (16f * d).roundToInt())
        lp.y = stored.getInt(KEY_Y, (96f * d).roundToInt())
        params = lp
        clampParams(lp)
        view.findViewById<android.view.View>(R.id.overlay_drag).setOnTouchListener { _, event ->
            onDrag(event)
        }
        view.findViewById<ImageView>(R.id.overlay_resize).setOnTouchListener { _, event ->
            onResize(event)
        }
        view.findViewById<TextView>(R.id.overlay_toggle).setOnClickListener { toggle() }
        view.findViewById<TextView>(R.id.overlay_close).setOnClickListener { closeBubble() }
        return try {
            wm.addView(view, lp)
            root = view
            OverlayPerm.proven = true
            prefs(this).edit().putBoolean(KEY_VISIBLE, true).apply()
            applyOpacity()
            applyScale()
            render()
            true
        } catch (e: Exception) {
            root = null
            if (isPermissionFailure(e)) OverlayPerm.proven = false
            false
        }
    }

    private fun onDrag(event: MotionEvent): Boolean {
        val p = params ?: return false
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                gesturing = true
                dragStartX = event.rawX
                dragStartY = event.rawY
                originX = p.x
                originY = p.y
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                p.x = (originX + (event.rawX - dragStartX)).roundToInt()
                p.y = (originY + (event.rawY - dragStartY)).roundToInt()
                clampParams(p)
                updateLayout()
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                gesturing = false
                saveBox()
                reportBox()
                return true
            }
        }
        return false
    }

    private fun onResize(event: MotionEvent): Boolean {
        val p = params ?: return false
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                gesturing = true
                dragStartX = event.rawX
                dragStartY = event.rawY
                originW = p.width
                originH = p.height
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val dw = event.rawX - dragStartX
                val dh = event.rawY - dragStartY
                resizeTo((originW + dw).roundToInt(), (originH + dh).roundToInt())
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                gesturing = false
                saveBox()
                reportBox()
                return true
            }
        }
        return false
    }

    private fun resizeTo(width: Int, height: Int) {
        val p = params ?: return
        val d = resources.displayMetrics.density
        val (sw, sh) = screen()
        val minW = (156f * d).roundToInt()
        val minH = (92f * d).roundToInt()
        val maxW = (sw * 0.94f).roundToInt()
        val maxH = (sh * 0.7f).roundToInt()
        p.width = width.coerceIn(minW, max(minW, maxW))
        p.height = height.coerceIn(minH, max(minH, maxH))
        clampParams(p)
        updateLayout()
        applyScale()
    }

    private fun applyScale() {
        val view = root ?: return
        val p = params ?: return
        val d = resources.displayMetrics.density
        val wDp = p.width / d
        val hDp = p.height / d
        val s = min(wDp / 260f, hDp / 128f).coerceIn(0.78f, 2.2f)
        view.findViewById<TextView>(R.id.overlay_label)?.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f * s)
        view.findViewById<TextView>(R.id.overlay_time)?.setTextSize(TypedValue.COMPLEX_UNIT_SP, 28f * s)
        val toggle = view.findViewById<TextView>(R.id.overlay_toggle)
        val close = view.findViewById<TextView>(R.id.overlay_close)
        toggle?.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f * s)
        close?.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f * s)
        val btn = (40f * s * d).roundToInt().coerceIn((36f * d).roundToInt(), (64f * d).roundToInt())
        toggle?.layoutParams?.height = btn
        close?.layoutParams?.width = btn
        close?.layoutParams?.height = btn
        toggle?.requestLayout()
    }

    private fun applyOpacity() {
        val view = root ?: return
        val bg = view.background?.mutate() ?: return
        bg.alpha = (opacity.coerceIn(0.35f, 1f) * 255).roundToInt()
        view.background = bg
    }

    private fun updateLayout() {
        val view = root ?: return
        val p = params ?: return
        try {
            windowManager?.updateViewLayout(view, p)
        } catch (_: Exception) {
        }
    }

    private fun clampParams(p: WindowManager.LayoutParams) {
        val (sw, sh) = screen()
        val margin = (4f * resources.displayMetrics.density).roundToInt()
        val maxX = (sw - p.width - margin).coerceAtLeast(margin)
        val maxY = (sh - p.height - margin).coerceAtLeast(margin)
        p.x = p.x.coerceIn(margin, maxX)
        p.y = p.y.coerceIn(margin, maxY)
    }

    private fun screen(): Pair<Int, Int> {
        val wm = windowManager ?: getSystemService(WindowManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val b = wm.currentWindowMetrics.bounds
            return b.width() to b.height()
        }
        val dm = resources.displayMetrics
        return dm.widthPixels to dm.heightPixels
    }

    private fun saveBox() {
        val p = params ?: return
        prefs(this).edit()
            .putInt(KEY_X, p.x)
            .putInt(KEY_Y, p.y)
            .putInt(KEY_W, p.width)
            .putInt(KEY_H, p.height)
            .putFloat(KEY_OPACITY, opacity)
            .apply()
    }

    private fun reportBox() {
        val p = params ?: return
        val d = resources.displayMetrics.density
        if (d <= 0f) return
        val x = (p.x / d).roundToInt()
        val y = (p.y / d).roundToInt()
        val w = (p.width / d).roundToInt()
        val h = (p.height / d).roundToInt()
        WebBridge.eval("window.__focusWidgetBox&&window.__focusWidgetBox($x,$y,$w,$h)")
    }

    private fun detach() {
        val view = root ?: return
        try {
            windowManager?.removeView(view)
        } catch (_: Exception) {
        }
        root = null
    }

    private fun toggle() {
        val now = System.currentTimeMillis()
        if (phase == "running") {
            left = remaining(now)
            endsAt = 0
            phase = "paused"
        } else {
            endsAt = now + left.coerceAtLeast(0)
            phase = "running"
        }
        writeState()
        render()
        WebBridge.eval("window.__focusSyncNative&&window.__focusSyncNative()")
    }

    private fun closeBubble() {
        val raw = prefs(this).getString(KEY_STATE, null)
        val editor = prefs(this).edit().putBoolean(KEY_VISIBLE, false).putString(KEY_PENDING, "close")
        if (raw != null) {
            try {
                val obj = JSONObject(raw)
                obj.put("visible", false)
                obj.put("widgetOpen", false)
                editor.putString(KEY_STATE, obj.toString())
            } catch (_: Exception) {
            }
        }
        editor.apply()
        WebBridge.eval("window.__focusCloseWidget&&window.__focusCloseWidget()")
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun writeState() {
        val obj = JSONObject()
        obj.put("phase", phase)
        obj.put("label", label)
        obj.put("left", if (phase == "running") remaining(System.currentTimeMillis()) else left)
        if (endsAt > 0) obj.put("endsAt", endsAt) else obj.put("endsAt", JSONObject.NULL)
        obj.put("widgetOpen", true)
        obj.put("visible", true)
        obj.put("opacity", opacity.toDouble())
        prefs(this).edit().putString(KEY_STATE, obj.toString()).putBoolean(KEY_VISIBLE, true).apply()
    }

    private fun openSettings() {
        if (OverlayPerm.live(this)) return
        val now = SystemClock.elapsedRealtime()
        if (now - lastAsk < 4000) return
        lastAsk = now
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:$packageName"),
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            startActivity(intent)
        } catch (_: Exception) {
        }
    }

    private fun notification(time: String): Notification {
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_focus)
            .setContentTitle(label)
            .setContentText(time)
            .setContentIntent(open)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .build()
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(CHANNEL, getString(R.string.channel_name), NotificationManager.IMPORTANCE_LOW)
        channel.description = getString(R.string.channel_desc)
        channel.setSound(null, null)
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    companion object {
        private const val EXTRA_STATE = "state"
        private const val EXTRA_ASK = "ask"
        private const val CHANNEL = "dymer_timer"
        private const val NOTE_ID = 7
        private const val KEY_STATE = "state"
        private const val KEY_PENDING = "pending"
        private const val KEY_VISIBLE = "visible"
        private const val KEY_X = "x"
        private const val KEY_Y = "y"
        private const val KEY_W = "w"
        private const val KEY_H = "h"
        private const val KEY_OPACITY = "opacity"

        private var instance: OverlayService? = null
        private var dragStartX = 0f
        private var dragStartY = 0f
        private var originX = 0
        private var originY = 0
        private var originW = 0
        private var originH = 0
        private var lastAsk = 0L

        fun start(context: Context, json: String, ask: Boolean) {
            val intent = Intent(context, OverlayService::class.java)
                .putExtra(EXTRA_STATE, json)
                .putExtra(EXTRA_ASK, ask)
            androidx.core.content.ContextCompat.startForegroundService(context, intent)
        }

        fun update(json: String) {
            val service = instance ?: return
            service.handler.post { service.apply(json) }
        }

        fun hide(context: Context) {
            context.stopService(Intent(context, OverlayService::class.java))
        }

        fun saved(context: Context): String {
            return prefs(context).getString(KEY_STATE, "") ?: ""
        }

        fun consumePending(context: Context): String {
            val store = prefs(context)
            val value = store.getString(KEY_PENDING, "") ?: ""
            if (value.isNotEmpty()) store.edit().remove(KEY_PENDING).apply()
            return value
        }

        private fun prefs(context: Context) =
            context.getSharedPreferences("dymer_overlay", Context.MODE_PRIVATE)

        private fun format(ms: Long): String {
            val total = if (ms <= 0) 0 else (ms + 999) / 1000
            val h = total / 3600
            val m = (total % 3600) / 60
            val s = total % 60
            return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%02d:%02d".format(m, s)
        }

        private fun isPermissionFailure(e: Exception): Boolean {
            val msg = (e.message ?: "").lowercase()
            return e is SecurityException || msg.contains("permission") || msg.contains("token null")
        }
    }
}
