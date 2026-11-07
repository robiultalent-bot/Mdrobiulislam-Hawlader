if [ -f native/Vision.kt ]; then grep -q 'mlkit' "$GR" || { case "$GR" in *.kts) printf '\ndependencies {\n    implementation("com.google.mlkit:text-recognition:16.0.1")\n    implementation("com.google.mlkit:face-detection:16.1.6")\n    implementation("com.google.mlkit:barcode-scanning:17.3.0")\n    implementation("com.google.mlkit:image-labeling:17.0.9")\n}\n' >> "$GR";; *) printf "\ndependencies {\n    implementation 'com.google.mlkit:text-recognition:16.0.1'\n    implementation 'com.google.mlkit:face-detection:16.1.6'\n    implementation 'com.google.mlkit:barcode-scanning:17.3.0'\n    implementation 'com.google.mlkit:image-labeling:17.0.9'\n}\n" >> "$GR";; esac; }; fi
grep -c 'play-services-ads' "$GR" | tee -a "$L" || true
grep -c 'ads.APPLICATION_ID' $MF | tee -a "$L" || true
for KF in android/settings.gradle android/settings.gradle.kts android/build.gradle android/build.gradle.kts; do
  if [ -f "$KF" ]; then
    sed -i -e 's/\(org.jetbrains.kotlin.android"[^0-9]*\)[0-9][0-9.]*/\12.0.21/' -e 's/\(kotlin_version[^0-9]*\)[0-9][0-9.]*/\12.0.21/' "$KF"
    grep -n 'kotlin' "$KF" | head -3 | tee -a "$L" || true
  fi
done
for SF in android/settings.gradle android/settings.gradle.kts; do
  if [ -f "$SF" ] && ! grep -Eq "include[ (]+['\"]:app['\"]" "$SF"; then
    case "$SF" in *.kts) printf '\ninclude(":app")\n' >> "$SF";; *) printf "\ninclude ':app'\n" >> "$SF";; esac
    echo "added include :app to $SF" | tee -a "$L"
  fi
done
cat android/settings.gradle* 2>/dev/null | head -30 | tee -a "$L" || true
MA=$(find android/app/src/main -name 'MainActivity.*' | head -1)
[ -z "$MA" ] && echo "ERROR: MainActivity not found" | tee -a "$L" && exit 1
PK=$(grep -m1 '^package ' "$MA" | sed 's/package //; s/;//; s/ //g')
echo "Native package: $PK  file: $MA" | tee -a "$L"
ASSETS=android/app/src/main/assets
mkdir -p "$ASSETS"
strip_obj(){ sed -i -e '/\/\/OBJ-BEGIN/,/\/\/OBJ-END/d' -e '/\/\/OBJ1/d' -e '/mediapipe/d' "$1"; }
OBJ=0
if [ -f native/Vision.kt ] && grep -q 'OBJ-BEGIN' native/Vision.kt; then
  MODEL="$ASSETS/efficientdet_lite0.tflite"
  for Q in float32 int8 float16; do
    if curl -fsSL --retry 2 -m 120 -o "$MODEL" "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/$Q/latest/efficientdet_lite0.tflite" 2>>"$L" && [ "$(wc -c < "$MODEL")" -gt 1000000 ]; then
      OBJ=1
      echo "Model $Q downloaded" | tee -a "$L"
      break
    fi
    rm -f "$MODEL"
  done
  [ "$OBJ" = "1" ] || echo "Model download failed, object detection off" | tee -a "$L"
fi
if [ "$OBJ" = "1" ]; then
  case "$GR" in
    *.kts) printf '\ndependencies {\n    implementation("com.google.mediapipe:tasks-vision:0.10.14")\n}\n' >> "$GR";;
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
  if [ "$VIS" = "1" ] && [ "$OBJ" = "1" ]; then
    echo "FALLBACK1: rebuilding without object detection" | tee -a "$L"
    strip_obj "$MD/Vision.kt"
    sed -i '/mediapipe/d' "$GR"
    if flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"; then exit 0; fi
  fi
  [ "$VIS" = "1" ] || exit 1
  echo "FALLBACK: first build failed, rebuilding without camera features" | tee -a "$L"
  rm -f "$MD/Vision.kt"
  cp native/MainActivity.kt "$MD/MainActivity.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/MainActivity.kt"
  sed -i '/com.google.mlkit/d' "$GR"
  flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"
fi
