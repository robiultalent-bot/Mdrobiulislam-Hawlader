package PKG_PLACEHOLDER

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import org.json.JSONArray
import org.json.JSONObject

class Mic(private val act: Activity, private val reply: (String, String) -> Unit) {
    private var rec: SpeechRecognizer? = null

    fun handle(name: String, args: JSONArray, id: String): Boolean {
        when (name) {
            "micListen" -> listen(args.optString(0, "bn-BD"), id)
            "micStop" -> {
                stop()
                reply(id, "true")
            }
            else -> return false
        }
        return true
    }

    private fun stop() {
        try {
            rec?.cancel()
            rec?.destroy()
        } catch (e: Exception) {
        }
        rec = null
    }

    private fun listen(lang: String, id: String) {
        if (Build.VERSION.SDK_INT >= 23 &&
            act.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED
        ) {
            try {
                act.requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), 78)
            } catch (e: Exception) {
            }
            reply(id, JSONObject().put("err", "perm").toString())
            return
        }
        if (!SpeechRecognizer.isRecognitionAvailable(act)) {
            reply(id, JSONObject().put("err", "na").toString())
            return
        }
        stop()
        val r = SpeechRecognizer.createSpeechRecognizer(act)
        rec = r
        r.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onError(error: Int) {
                reply(id, JSONObject().put("err", "e" + error).toString())
                stop()
            }

            override fun onResults(results: Bundle?) {
                val l = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val t = if (l != null && l.size > 0) l[0] else ""
                reply(id, JSONObject().put("text", t).toString())
                stop()
            }

            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })
        val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        r.startListening(i)
    }
}
