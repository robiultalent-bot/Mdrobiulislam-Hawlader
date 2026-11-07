package PKG_PLACEHOLDER

import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.text.SpannableString
import android.text.Spanned
import android.text.style.AbsoluteSizeSpan
import android.text.style.BackgroundColorSpan
import android.text.style.ForegroundColorSpan
import androidx.media3.common.Effect
import androidx.media3.common.MediaItem
import androidx.media3.common.audio.AudioProcessor
import androidx.media3.common.audio.ChannelMixingAudioProcessor
import androidx.media3.common.audio.ChannelMixingMatrix
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.Brightness
import androidx.media3.effect.Contrast
import androidx.media3.effect.HslAdjustment
import androidx.media3.effect.OverlayEffect
import androidx.media3.effect.OverlaySettings
import androidx.media3.effect.Presentation
import androidx.media3.effect.RgbFilter
import androidx.media3.effect.TextOverlay
import androidx.media3.effect.TextureOverlay
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.Transformer
import com.google.common.collect.ImmutableList
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

@androidx.annotation.OptIn(markerClass = [UnstableApi::class])
class VideoEngine(
    private val act: Activity,
    private val reply: (String, String) -> Unit,
    private val js: (String) -> Unit
) {
    private val main = Handler(Looper.getMainLooper())
    private val rcVideo = 7101
    private val rcAudio = 7102
    private var pickId: String? = null
    private var transformer: Transformer? = null
    private var busy = false
    private var cancelled = false

    fun handle(name: String, args: JSONArray, id: String): Boolean {
        when (name) {
            "vedPick" -> pick(true, id)
            "vedPickAudio" -> pick(false, id)
            "vedExport" -> startExport(args.optString(0, "{}"), id)
            "vedCancel" -> cancelExport(id)
            else -> return false
        }
        return true
    }

    private fun done(id: String, json: String) {
        act.runOnUiThread { reply(id, json) }
    }

    private fun pick(video: Boolean, id: String) {
        if (pickId != null) {
            reply(id, "{}")
            return
        }
        pickId = id
        try {
            val i = Intent(Intent.ACTION_GET_CONTENT)
            i.type = if (video) "video/*" else "audio/*"
            i.addCategory(Intent.CATEGORY_OPENABLE)
            act.startActivityForResult(Intent.createChooser(i, ""), if (video) rcVideo else rcAudio)
        } catch (e: Exception) {
            pickId = null
            reply(id, "{}")
        }
    }

    fun onResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != rcVideo && requestCode != rcAudio) return
        val id = pickId ?: return
        pickId = null
        val uri: Uri? = if (resultCode == Activity.RESULT_OK) data?.data else null
        if (uri == null) {
            reply(id, "{}")
            return
        }
        val isVideo = requestCode == rcVideo
        Thread {
            try {
                val prefix = if (isVideo) "ved_v_" else "ved_a_"
                act.cacheDir.listFiles()?.forEach {
                    if (it.name.startsWith(prefix)) it.delete()
                }
                val dest = File(act.cacheDir, prefix + System.currentTimeMillis())
                val ins = act.contentResolver.openInputStream(uri)
                if (ins == null) {
                    done(id, "{}")
                    return@Thread
                }
                ins.use { src ->
                    FileOutputStream(dest).use { out -> src.copyTo(out) }
                }
                val o = JSONObject()
                o.put("ok", true)
                o.put("path", dest.absolutePath)
                o.put("url", "file://" + dest.absolutePath)
                val mmr = MediaMetadataRetriever()
                try {
                    mmr.setDataSource(dest.absolutePath)
                    val dur = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
                    o.put("durationMs", dur)
                    if (isVideo) {
                        var w = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 0
                        var h = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 0
                        val rot = mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
                        if (rot == 90 || rot == 270) {
                            val t = w
                            w = h
                            h = t
                        }
                        o.put("width", w)
                        o.put("height", h)
                        o.put("hasAudio", "yes" == mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_HAS_AUDIO))
                    }
                } finally {
                    try {
                        mmr.release()
                    } catch (e: Exception) {
                    }
                }
                done(id, o.toString())
            } catch (e: Throwable) {
                done(id, "{}")
            }
        }.start()
    }

    private fun cancelExport(id: String) {
        cancelled = true
        try {
            transformer?.cancel()
        } catch (e: Exception) {
        }
        reply(id, "true")
    }

    private class Job(val p: JSONObject) {
        var level = 0
        val skipped = JSONArray()
    }

    private fun startExport(json: String, id: String) {
        if (busy) {
            reply(id, "{\"ok\":false,\"error\":\"busy\"}")
            return
        }
        val p: JSONObject
        try {
            p = JSONObject(json)
        } catch (e: Exception) {
            reply(id, "{\"ok\":false,\"error\":\"bad params\"}")
            return
        }
        busy = true
        cancelled = false
        runLevel(Job(p), id)
    }

    private fun fail(id: String, msg: String) {
        busy = false
        transformer = null
        val o = JSONObject()
        o.put("ok", false)
        o.put("error", msg)
        o.put("cancelled", cancelled)
        reply(id, o.toString())
    }

    private fun wmText(p: JSONObject, outH: Int): SpannableString? {
        val t = p.optString("wm", "")
        if (t.isEmpty()) return null
        val s = SpannableString(t)
        var px = (outH * 0.03).toInt()
        if (px < 14) px = 14
        s.setSpan(AbsoluteSizeSpan(px), 0, t.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        s.setSpan(ForegroundColorSpan(0xFFFFFFFF.toInt()), 0, t.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        s.setSpan(BackgroundColorSpan(0x66000000), 0, t.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        return s
    }

    private fun volProc(v: Float): AudioProcessor {
        val cm = ChannelMixingAudioProcessor()
        cm.putChannelMixingMatrix(ChannelMixingMatrix.create(1, 1).scaleBy(v))
        cm.putChannelMixingMatrix(ChannelMixingMatrix.create(2, 2).scaleBy(v))
        return cm
    }

    private fun runLevel(job: Job, id: String) {
        try {
            val p = job.p
            val src = p.optString("src", "")
            if (src.isEmpty() || !File(src).exists()) {
                fail(id, "no source")
                return
            }
            val srcW = p.optInt("width", 0)
            val srcH = p.optInt("height", 0)
            val startMs = p.optLong("startMs", 0L)
            var endMs = p.optLong("endMs", 0L)
            val full = endMs <= startMs
            val clip = MediaItem.ClippingConfiguration.Builder().setStartPositionMs(startMs)
            if (!full) clip.setEndPositionMs(endMs)
            val item = MediaItem.Builder().setUri(Uri.fromFile(File(src)))
                .setClippingConfiguration(clip.build()).build()
            val vfx = ArrayList<Effect>()
            var outH = if (srcH > 0) srcH else 720
            if (job.level < 2) {
                val ratio = p.optString("ratio", "orig")
                var a = 0f
                when (ratio) {
                    "9:16" -> a = 9f / 16f
                    "16:9" -> a = 16f / 9f
                    "1:1" -> a = 1f
                    "4:3" -> a = 4f / 3f
                }
                if (a > 0f) {
                    vfx.add(Presentation.createForAspectRatio(a, Presentation.LAYOUT_SCALE_TO_FIT_WITH_CROP))
                    if (srcW > 0 && srcH > 0) {
                        val sa = srcW.toFloat() / srcH.toFloat()
                        outH = if (a < sa) srcH else (srcW / a).toInt()
                    }
                }
                val br = p.optDouble("brightness", 0.0).toFloat()
                val ct = p.optDouble("contrast", 0.0).toFloat()
                val sat = p.optDouble("saturation", 0.0).toFloat()
                if (p.optBoolean("gray", false)) vfx.add(RgbFilter.createGrayscaleFilter())
                if (Math.abs(br) > 0.001f) vfx.add(Brightness(br.coerceIn(-1f, 1f)))
                if (Math.abs(ct) > 0.001f) vfx.add(Contrast(ct.coerceIn(-1f, 1f)))
                if (Math.abs(sat) > 0.001f) {
                    vfx.add(HslAdjustment.Builder().adjustSaturation(sat.coerceIn(-100f, 100f)).build())
                }
            } else if (job.level == 2) {
                job.skipped.put("effects")
            }
            val ws = wmText(p, outH)
            if (ws != null) {
                val st = OverlaySettings.Builder()
                    .setBackgroundFrameAnchor(0f, -0.92f)
                    .setOverlayFrameAnchor(0f, -1f)
                    .setAlphaScale(0.92f)
                    .build()
                val ov: TextureOverlay = TextOverlay.createStaticTextOverlay(ws, st)
                vfx.add(OverlayEffect(ImmutableList.of(ov)))
            }
            val vol = p.optDouble("volume", 1.0).toFloat()
            val ap = ArrayList<AudioProcessor>()
            if (job.level == 0 && Math.abs(vol - 1f) > 0.01f) ap.add(volProc(vol.coerceIn(0f, 2f)))
            val mainItem = EditedMediaItem.Builder(item).setEffects(Effects(ap, vfx)).build()
            val music = p.optJSONObject("music")
            val useMusic = job.level == 0 && music != null && File(music.optString("path", "")).exists()
            if (job.level > 0 && music != null) job.skipped.put("music")
            val outFile = File(act.cacheDir, "ved_out_" + System.currentTimeMillis() + ".mp4")
            val listener = object : Transformer.Listener {
                override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                    finishOk(job, outFile, id)
                }

                override fun onError(
                    composition: Composition,
                    exportResult: ExportResult,
                    exportException: ExportException
                ) {
                    try {
                        outFile.delete()
                    } catch (e: Exception) {
                    }
                    if (cancelled || job.level >= 2) {
                        fail(id, exportException.getErrorCodeName() + ": " + (exportException.message ?: ""))
                    } else {
                        job.level += 1
                        main.post { runLevel(job, id) }
                    }
                }
            }
            val t = Transformer.Builder(act).addListener(listener).build()
            transformer = t
            if (useMusic && music != null) {
                val mv = music.optDouble("volume", 0.5).toFloat().coerceIn(0f, 2f)
                val mStart = music.optLong("startMs", 0L)
                val len = if (full) 0L else endMs - startMs
                val mc = MediaItem.ClippingConfiguration.Builder().setStartPositionMs(mStart)
                if (len > 0L) mc.setEndPositionMs(mStart + len)
                val mItem = MediaItem.Builder().setUri(Uri.fromFile(File(music.optString("path"))))
                    .setClippingConfiguration(mc.build()).build()
                val map = ArrayList<AudioProcessor>()
                map.add(volProc(mv))
                val mEdited = EditedMediaItem.Builder(mItem).setRemoveVideo(true)
                    .setEffects(Effects(map, ArrayList<Effect>())).build()
                val comp = Composition.Builder(
                    EditedMediaItemSequence(ImmutableList.of(mainItem)),
                    EditedMediaItemSequence(ImmutableList.of(mEdited))
                ).build()
                t.start(comp, outFile.absolutePath)
            } else {
                t.start(mainItem, outFile.absolutePath)
            }
            poll(t, id)
        } catch (e: Throwable) {
            if (job.level >= 2 || cancelled) {
                fail(id, e.toString())
            } else {
                job.level += 1
                runLevel(job, id)
            }
        }
    }

    private fun poll(t: Transformer, id: String) {
        main.postDelayed(object : Runnable {
            override fun run() {
                if (!busy || transformer !== t) return
                try {
                    val ph = ProgressHolder()
                    val st = t.getProgress(ph)
                    if (st == Transformer.PROGRESS_STATE_AVAILABLE) {
                        js("window.__vedProgress&&window.__vedProgress(" + ph.progress + ")")
                    }
                } catch (e: Throwable) {
                }
                main.postDelayed(this, 600)
            }
        }, 600)
    }

    private fun finishOk(job: Job, out: File, id: String) {
        Thread {
            var uriStr = ""
            val name = "MonerAlo_" + System.currentTimeMillis() + ".mp4"
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    val cv = ContentValues()
                    cv.put(MediaStore.Video.Media.DISPLAY_NAME, name)
                    cv.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
                    cv.put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/MonerAlo")
                    cv.put(MediaStore.Video.Media.IS_PENDING, 1)
                    val r = act.contentResolver
                    val u = r.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, cv)
                    if (u != null) {
                        r.openOutputStream(u)?.use { os -> out.inputStream().use { it.copyTo(os) } }
                        val cv2 = ContentValues()
                        cv2.put(MediaStore.Video.Media.IS_PENDING, 0)
                        r.update(u, cv2, null, null)
                        uriStr = u.toString()
                    }
                } else {
                    val dir = act.getExternalFilesDir(Environment.DIRECTORY_MOVIES)
                    if (dir != null) {
                        dir.mkdirs()
                        val f = File(dir, name)
                        out.copyTo(f, true)
                        uriStr = f.absolutePath
                    }
                }
            } catch (e: Throwable) {
                uriStr = ""
            }
            act.runOnUiThread {
                busy = false
                transformer = null
                val o = JSONObject()
                o.put("ok", true)
                o.put("saved", uriStr.isNotEmpty())
                o.put("uri", uriStr)
                o.put("name", name)
                o.put("path", out.absolutePath)
                o.put("url", "file://" + out.absolutePath)
                o.put("skipped", job.skipped)
                js("window.__vedProgress&&window.__vedProgress(100)")
                reply(id, o.toString())
            }
        }.start()
    }
}
