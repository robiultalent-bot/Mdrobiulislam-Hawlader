package PKG_PLACEHOLDER

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap

class MainActivity : Activity() {
    private lateinit var web: WebView
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var engineName = ""
    private val pending = ConcurrentHashMap<String, String>()
    private var uttCounter = 0
    private lateinit var ads: AdHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        ads = AdHelper(this) { cid, json -> resolve(cid, json) }
        ads.init()
        web = WebView(this)
        setContentView(web)
        val s = web.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.allowFileAccess = true
        s.mediaPlaybackRequiresUserGesture = false
        s.setSupportZoom(false)
        web.setBackgroundColor(0xFF0B1020.toInt())
        web.addJavascriptInterface(Bridge(), "AndroidTTS")
        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val u = request?.url ?: return false
                val sc = u.scheme ?: return false
                if (sc == "http" || sc == "https" || sc == "mailto" || sc == "tel") {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, u))
                    } catch (e: Exception) {
                    }
                    return true
                }
                return false
            }
        }
        web.loadUrl("file:///android_asset/index.html")
    }

    inner class Bridge {
        @JavascriptInterface
        fun call(name: String, argsJson: String, id: String) {
            runOnUiThread {
                try {
                    handle(name, JSONArray(argsJson), id)
                } catch (e: Exception) {
                    reject(id, e.toString())
                }
            }
        }
    }

    private fun resolve(id: String, json: String) {
        web.evaluateJavascript("window.__ntResolve('" + id + "',true," + json + ")", null)
    }

    private fun reject(id: String, msg: String) {
        web.evaluateJavascript("window.__ntResolve('" + id + "',false," + JSONObject.quote(msg) + ")", null)
    }

    private fun handle(name: String, args: JSONArray, id: String) {
        when (name) {
            "ttsInit" -> {
                val engine = if (args.isNull(0)) "" else args.optString(0, "")
                ensureTts(engine) { resolve(id, buildInit().toString()) }
            }
            "ttsSpeak" -> {
                val p = args.optJSONObject(0)
                if (p == null) {
                    resolve(id, "true")
                } else {
                    ensureTts("") { speak(p, id) }
                }
            }
            "ttsStop" -> {
                tts?.stop()
                resolve(id, "true")
            }
            "adLoad" -> ads.load(if (args.isNull(0)) "" else args.optString(0, ""), id)
            "adShow" -> ads.show(id) {
                try {
                    tts?.stop()
                } catch (e: Exception) {
                }
            }
            else -> reject(id, "unknown handler: " + name)
        }
    }

    private fun ensureTts(engine: String, onReady: () -> Unit) {
        val cur = tts
        if (cur != null && ttsReady && (engine.isEmpty() || engine == engineName)) {
            onReady()
            return
        }
        if (cur != null) {
            try {
                cur.shutdown()
            } catch (e: Exception) {
            }
        }
        ttsReady = false
        val listener = TextToSpeech.OnInitListener { status ->
            runOnUiThread {
                ttsReady = (status == TextToSpeech.SUCCESS)
                if (ttsReady) {
                    tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(utteranceId: String?) {}
                        override fun onDone(utteranceId: String?) {
                            utteranceDone(utteranceId)
                        }

                        @Deprecated("Deprecated in Java")
                        override fun onError(utteranceId: String?) {
                            utteranceDone(utteranceId)
                        }

                        override fun onStop(utteranceId: String?, interrupted: Boolean) {
                            utteranceDone(utteranceId)
                        }
                    })
                }
                onReady()
            }
        }
        if (engine.isEmpty()) {
            tts = TextToSpeech(this, listener)
        } else {
            engineName = engine
            tts = TextToSpeech(this, listener, engine)
        }
    }

    private fun utteranceDone(utteranceId: String?) {
        if (utteranceId == null) return
        val cb = pending.remove(utteranceId) ?: return
        runOnUiThread { resolve(cb, "true") }
    }

    private fun buildInit(): JSONObject {
        val o = JSONObject()
        val engines = JSONArray()
        var current = ""
        val t = tts
        if (t != null) {
            try {
                for (e in t.engines) engines.put(e.name)
                current = t.defaultEngine ?: ""
            } catch (e: Exception) {
            }
        }
        val voices = JSONArray()
        if (t != null && ttsReady) {
            try {
                val vs = t.voices
                if (vs != null) {
                    for (v in vs) {
                        val vo = JSONObject()
                        vo.put("name", v.name)
                        vo.put("locale", v.locale.toLanguageTag())
                        vo.put("network_required", if (v.isNetworkConnectionRequired) "1" else "0")
                        voices.put(vo)
                    }
                }
            } catch (e: Exception) {
            }
        }
        o.put("engines", engines)
        o.put("engine", if (engineName.isNotEmpty()) engineName else current)
        o.put("rate", JSONObject().put("normal", 0.5).put("min", 0.05).put("max", 1.0))
        o.put("pitch", JSONObject().put("normal", 1.0))
        o.put("voices", voices)
        return o
    }

    private fun speak(p: JSONObject, id: String) {
        val t = tts
        val text = p.optString("text", "")
        if (t == null || !ttsReady || text.trim().isEmpty()) {
            resolve(id, "true")
            return
        }
        try {
            val lang = p.optString("lang", "bn-BD")
            t.language = Locale.forLanguageTag(lang)
            val vj = p.optJSONObject("voice")
            if (vj != null) {
                val vn = vj.optString("name", "")
                if (vn.isNotEmpty()) {
                    val vs = t.voices
                    if (vs != null) {
                        for (v in vs) {
                            if (v.name == vn) {
                                t.voice = v
                                break
                            }
                        }
                    }
                }
            }
            t.setSpeechRate((p.optDouble("rate", 0.5) * 2.0).toFloat())
            t.setPitch(p.optDouble("pitch", 1.0).toFloat())
            var vol = p.optDouble("volume", 1.0)
            if (vol < 0.0) vol = 0.0
            if (vol > 1.0) vol = 1.0
            val params = Bundle()
            params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, vol.toFloat())
            uttCounter += 1
            val uid = "u" + uttCounter
            pending[uid] = id
            val r = t.speak(text, TextToSpeech.QUEUE_FLUSH, params, uid)
            if (r != TextToSpeech.SUCCESS) {
                pending.remove(uid)
                resolve(id, "true")
            }
        } catch (e: Exception) {
            resolve(id, "true")
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
        }
        web.destroy()
        super.onDestroy()
    }
}