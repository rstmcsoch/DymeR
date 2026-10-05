package com.dymer.dypol

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import kotlin.math.min

class MainActivity : ComponentActivity() {
    private var webView: WebView? = null
    private var askedNotifications = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        val view = WebView(this)
        webView = view
        WebBridge.webView = view
        view.setBackgroundColor(0xFFF7F2EF.toInt())
        view.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
        )
        val settings = view.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.textZoom = 100
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.layoutAlgorithm = WebSettings.LayoutAlgorithm.NORMAL
        view.addJavascriptInterface(NativeBridge(this), "FocusNative")
        view.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                webView: WebView,
                request: android.webkit.WebResourceRequest,
            ) = assetLoader.shouldInterceptRequest(request.url)

            override fun onPageFinished(webView: WebView, url: String?) {
                applyUiScale(webView)
            }
        }
        setContentView(view)
        view.loadUrl("https://appassets.androidplatform.net/assets/apk/index.html")

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (view.canGoBack()) view.goBack() else moveTaskToBack(true)
                }
            },
        )
    }

    override fun onResume() {
        super.onResume()
        webView?.let { applyUiScale(it) }
        webView?.evaluateJavascript("window.__focusAfterPermission&&window.__focusAfterPermission()", null)
        if (!askedNotifications && Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            askedNotifications = true
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 42)
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        webView?.let { applyUiScale(it) }
    }

    override fun onDestroy() {
        if (WebBridge.webView === webView) WebBridge.webView = null
        webView?.destroy()
        webView = null
        super.onDestroy()
    }

    private fun applyUiScale(view: WebView) {
        val dm = resources.displayMetrics
        val widthDp = dm.widthPixels / dm.density
        val heightDp = dm.heightPixels / dm.density
        val shortDp = min(widthDp, heightDp)
        val base = (15f + (shortDp - 340f) * 0.03f).coerceIn(15f, 21f)
        val fontScale = resources.configuration.fontScale.coerceIn(0.9f, 1.35f)
        val root = (base * fontScale).coerceIn(14f, 26f)
        view.evaluateJavascript(
            "document.documentElement.style.fontSize='${root}px';document.documentElement.style.setProperty('--app-short','${shortDp}');",
            null,
        )
    }
}
