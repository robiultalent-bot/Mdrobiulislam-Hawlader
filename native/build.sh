open(p,"w",encoding="utf-8").write(s)
VIS_PY
  then VIS=1; echo "Vision enabled" | tee -a "$L"; else echo "Vision patch failed, skipped" | tee -a "$L"; rm -f "$MD/Vision.kt"; fi
fi
VED=0
if [ -f native/VideoEngine.kt ]; then
  cp native/VideoEngine.kt "$MD/VideoEngine.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/VideoEngine.kt"
  if python3 - "$MD/MainActivity.kt" <<'VED_PY'
import sys
p=sys.argv[1]
s=open(p,encoding="utf-8").read()
s=s.replace("    private lateinit var ads: AdHelper\n","    private lateinit var ads: AdHelper\n    private lateinit var video: VideoEngine //VID\n",1)
s=s.replace("        ads.init()\n","        ads.init()\n        video = VideoEngine(this, { cid, json -> resolve(cid, json) }, { code -> web.evaluateJavascript(code, null) }) //VID\n",1)
s=s.replace("            else -> ","            \"vedPick\", \"vedPickAudio\", \"vedExport\", \"vedCancel\" -> video.handle(name, args, id) //VID\n            else -> ",1)
a='    @Deprecated("Deprecated in Java")\n    override fun onBackPressed()'
b='    @Deprecated("Deprecated in Java") //VID\n    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) { //VID\n        super.onActivityResult(requestCode, resultCode, data) //VID\n        video.onResult(requestCode, resultCode, data) //VID\n    } //VID\n'
s=s.replace(a,b+a,1)
for k in ["private lateinit var video","video = VideoEngine(","video.handle(","video.onResult("]:
    assert k in s,k
open(p,"w",encoding="utf-8").write(s)
VED_PY
  then
    case "$GR" in
      *.kts) printf '\ndependencies {\n    implementation("androidx.media3:media3-transformer:1.4.1")\n    implementation("androidx.media3:media3-effect:1.4.1")\n    implementation("androidx.media3:media3-common:1.4.1")\n}\n' >> "$GR";;
      *) printf "\ndependencies {\n    implementation 'androidx.media3:media3-transformer:1.4.1'\n    implementation 'androidx.media3:media3-effect:1.4.1'\n    implementation 'androidx.media3:media3-common:1.4.1'\n}\n" >> "$GR";;
    esac
    VED=1
    echo "Video enabled" | tee -a "$L"
  else
    echo "Video patch failed, skipped" | tee -a "$L"
    rm -f "$MD/VideoEngine.kt"
  fi
fi
head -3 "$MD/MainActivity.kt" | tee -a "$L"
flutter pub get 2>&1 | tee -a "$L"
if ! flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then
  MV=$(grep -o 'binary version of its metadata is [0-9][0-9.]*' "$L" | head -1 | grep -o '[0-9][0-9.]*$' || true)
  if [ -n "$MV" ]; then
    KV=$(python3 -c "import sys;a=sys.argv[1].split('.');m=(int(a[0]),int(a[1]));print({(2,1):'2.1.20',(2,2):'2.2.20'}.get(m,'%d.%d.0'%m))" "$MV")
    echo "RETRY: dependency needs Kotlin metadata $MV, switching Kotlin to $KV" | tee -a "$L"
    for KF in android/settings.gradle android/settings.gradle.kts android/build.gradle android/build.gradle.kts; do
      [ -f "$KF" ] && sed -i -e "s/\(org.jetbrains.kotlin.android\"[^0-9]*\)[0-9][0-9.]*/\1$KV/" -e "s/\(kotlin_version[^0-9]*\)[0-9][0-9.]*/\1$KV/" "$KF"
    done
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  if [ "$VED" = "1" ]; then
    echo "FALLBACK0: rebuilding without video editor" | tee -a "$L"
    strip_video
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  if [ "$VIS" = "1" ] && [ "$OBJ" = "1" ]; then
    echo "FALLBACK1: rebuilding without object detection" | tee -a "$L"
    strip_obj "$MD/Vision.kt"
    sed -i '/mediapipe/d' "$GR"
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  [ "$VIS" = "1" ] || exit 1
  echo "FALLBACK: first build failed, rebuilding without camera features" | tee -a "$L"
  rm -f "$MD/Vision.kt" "$MD/VideoEngine.kt"
  sed -i '/androidx.media3/d' "$GR"
  cp native/MainActivity.kt "$MD/MainActivity.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/MainActivity.kt"
  sed -i '/com.google.mlkit/d' "$GR"
  flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"
fi
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
    *) printf "\ndependencies {\n    implementation 'com.google.mediapipe:tasks-vision:0.10.14'\n}\n" >> "$GR";;
  esac
  python3 - "$GR" <<'NC_PY'
import re,sys
p=sys.argv[1]
s=open(p,encoding="utf-8").read()
add='\n    androidResources {\n        noCompress += "tflite"\n    }' if p.endswith('.kts') else '\n    aaptOptions {\n        noCompress "tflite"\n    }'
s=re.sub(r'\nandroid\s*\{',lambda m:m.group(0)+add,s,count=1)
open(p,"w",encoding="utf-8").write(s)
NC_PY
fi
cp assets/index.html "$ASSETS/index.html"
[ -f native/shim.js ] && [ -f native/MainActivity.kt ] && [ -f native/AdHelper.kt ] || { echo "ERROR: native/ folder files missing (shim.js, MainActivity.kt, AdHelper.kt)" | tee -a "$L"; exit 1; }
cp native/shim.js "$ASSETS/shim.js"
sed -i '0,/<head>/s//<head><script src="shim.js"><\/script>/' "$ASSETS/index.html"
grep -c 'shim.js' "$ASSETS/index.html" | tee -a "$L"
for MODJS in soundscape.js ads.js explore.js; do
  if [ -f "assets/$MODJS" ]; then
    cp "assets/$MODJS" "$ASSETS/$MODJS"
    python3 - "$ASSETS/index.html" "$MODJS" <<'SND_PY'
import sys
p,m=sys.argv[1],sys.argv[2]
h=open(p,encoding="utf-8").read()
tag='<script src="'+m+'"></script>'
i=h.rfind('</body>')
h=h[:i]+tag+'\n'+h[i:] if i>=0 else h+'\n'+tag
open(p,"w",encoding="utf-8").write(h)
SND_PY
    echo "$MODJS injected" | tee -a "$L"
  else
    echo "no assets/$MODJS (skipped)" | tee -a "$L"
  fi
done
rm -f "$MA"
MD="$(dirname "$MA")"
cp native/MainActivity.kt "$MD/MainActivity.kt"
cp native/AdHelper.kt "$MD/AdHelper.kt"
sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/MainActivity.kt" "$MD/AdHelper.kt"
VIS=0
if [ -f native/Vision.kt ]; then
  cp native/Vision.kt "$MD/Vision.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/Vision.kt"
  [ "$OBJ" = "1" ] || strip_obj "$MD/Vision.kt"
  if python3 - "$MD/MainActivity.kt" <<'VIS_PY'
import sys
p=sys.argv[1]
s=open(p,encoding="utf-8").read()
s=s.replace("    private lateinit var ads: AdHelper\n","    private lateinit var ads: AdHelper\n    private lateinit var vision: Vision\n",1)
s=s.replace("        ads.init()\n","        ads.init()\n        vision = Vision(this) { cid, json -> resolve(cid, json) }\n",1)
s=s.replace("        web.webChromeClient = WebChromeClient()\n","        web.webChromeClient = object : WebChromeClient() {\n            override fun onPermissionRequest(request: android.webkit.PermissionRequest) {\n                runOnUiThread {\n                    try {\n                        request.grant(request.resources)\n                    } catch (e: Exception) {\n                    }\n                }\n            }\n        }\n",1)
s=s.replace('            else -> reject(id, "unknown handler: " + name)\n','            else -> if (!vision.handle(name, args, id)) reject(id, "unknown handler: " + name)\n',1)
for k in ["private lateinit var vision","vision = Vision(","onPermissionRequest","vision.handle("]:
    assert k in s,k
open(p,"w",encoding="utf-8").write(s)
VIS_PY
  then VIS=1; echo "Vision enabled" | tee -a "$L"; else echo "Vision patch failed, skipped" | tee -a "$L"; rm -f "$MD/Vision.kt"; fi
fi
VED=0
if [ -f native/VideoEngine.kt ]; then
  cp native/VideoEngine.kt "$MD/VideoEngine.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/VideoEngine.kt"
  if python3 - "$MD/MainActivity.kt" <<'VED_PY'
import sys
p=sys.argv[1]
s=open(p,encoding="utf-8").read()
s=s.replace("    private lateinit var ads: AdHelper\n","    private lateinit var ads: AdHelper\n    private lateinit var video: VideoEngine //VID\n",1)
s=s.replace("        ads.init()\n","        ads.init()\n        video = VideoEngine(this, { cid, json -> resolve(cid, json) }, { code -> web.evaluateJavascript(code, null) }) //VID\n",1)
s=s.replace("            else -> ","            \"vedPick\", \"vedPickAudio\", \"vedExport\", \"vedCancel\" -> video.handle(name, args, id) //VID\n            else -> ",1)
a='    @Deprecated("Deprecated in Java")\n    override fun onBackPressed()'
b='    @Deprecated("Deprecated in Java") //VID\n    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) { //VID\n        super.onActivityResult(requestCode, resultCode, data) //VID\n        video.onResult(requestCode, resultCode, data) //VID\n    } //VID\n'
s=s.replace(a,b+a,1)
for k in ["private lateinit var video","video = VideoEngine(","video.handle(","video.onResult("]:
    assert k in s,k
open(p,"w",encoding="utf-8").write(s)
VED_PY
  then
    case "$GR" in
      *.kts) printf '\ndependencies {\n    implementation("androidx.media3:media3-transformer:1.4.1")\n    implementation("androidx.media3:media3-effect:1.4.1")\n    implementation("androidx.media3:media3-common:1.4.1")\n}\n' >> "$GR";;
      *) printf "\ndependencies {\n    implementation 'androidx.media3:media3-transformer:1.4.1'\n    implementation 'androidx.media3:media3-effect:1.4.1'\n    implementation 'androidx.media3:media3-common:1.4.1'\n}\n" >> "$GR";;
    esac
    VED=1
    echo "Video enabled" | tee -a "$L"
  else
    echo "Video patch failed, skipped" | tee -a "$L"
    rm -f "$MD/VideoEngine.kt"
  fi
fi
head -3 "$MD/MainActivity.kt" | tee -a "$L"
flutter pub get 2>&1 | tee -a "$L"
if ! flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then
  MV=$(grep -o 'binary version of its metadata is [0-9][0-9.]*' "$L" | head -1 | grep -o '[0-9][0-9.]*$' || true)
  if [ -n "$MV" ]; then
    KV=$(python3 -c "import sys;a=sys.argv[1].split('.');m=(int(a[0]),int(a[1]));print({(2,1):'2.1.20',(2,2):'2.2.20'}.get(m,'%d.%d.0'%m))" "$MV")
    echo "RETRY: dependency needs Kotlin metadata $MV, switching Kotlin to $KV" | tee -a "$L"
    for KF in android/settings.gradle android/settings.gradle.kts android/build.gradle android/build.gradle.kts; do
      [ -f "$KF" ] && sed -i -e "s/\(org.jetbrains.kotlin.android\"[^0-9]*\)[0-9][0-9.]*/\1$KV/" -e "s/\(kotlin_version[^0-9]*\)[0-9][0-9.]*/\1$KV/" "$KF"
    done
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  if [ "$VED" = "1" ]; then
    echo "FALLBACK0: rebuilding without video editor" | tee -a "$L"
    strip_video
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  if [ "$VIS" = "1" ] && [ "$OBJ" = "1" ]; then
    echo "FALLBACK1: rebuilding without object detection" | tee -a "$L"
    strip_obj "$MD/Vision.kt"
    sed -i '/mediapipe/d' "$GR"
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  [ "$VIS" = "1" ] || exit 1
  echo "FALLBACK: first build failed, rebuilding without camera features" | tee -a "$L"
  rm -f "$MD/Vision.kt" "$MD/VideoEngine.kt"
  sed -i '/androidx.media3/d' "$GR"
  cp native/MainActivity.kt "$MD/MainActivity.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/MainActivity.kt"
  sed -i '/com.google.mlkit/d' "$GR"
  flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"
fi
