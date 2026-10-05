package com.dymer.dypol

import android.webkit.JavascriptInterface
import android.webkit.WebView

object WebBridge {
    var webView: WebView? = null

    fun eval(script: String) {
        val view = webView ?: return
        view.post { view.evaluateJavascript(script, null) }
    }
}

class NativeBridge(private val activity: MainActivity) {
    @JavascriptInterface
    fun canDraw(): Boolean = OverlayPerm.allowed(activity.applicationContext)

    @JavascriptInterface
    fun requestPermission() {
        activity.runOnUiThread { OverlayService.start(activity.applicationContext, OverlayService.saved(activity), true) }
    }

    @JavascriptInterface
    fun ensure(json: String, ask: Boolean) {
        activity.runOnUiThread { OverlayService.start(activity.applicationContext, json, ask) }
    }

    @JavascriptInterface
    fun show(json: String) {
        ensure(json, false)
    }

    @JavascriptInterface
    fun update(json: String) {
        OverlayService.update(json)
    }

    @JavascriptInterface
    fun hide() {
        activity.runOnUiThread { OverlayService.hide(activity.applicationContext) }
    }

    @JavascriptInterface
    fun consumePending(): String = OverlayService.consumePending(activity)

    @JavascriptInterface
    fun overlayState(): String = OverlayService.saved(activity)
}
