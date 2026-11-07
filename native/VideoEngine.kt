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
