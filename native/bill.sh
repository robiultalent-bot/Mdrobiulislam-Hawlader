PK=$(grep -m1 '^package ' "$MA" | sed 's/package //; s/;//; s/ //g')
echo "Native package: $PK  file: $MA" | tee -a "$L"
ASSETS=android/app/src/main/assets
mkdir -p "$ASSETS"
cp assets/index.html "$ASSETS/index.html"
[ -f native/shim.js ] && [ -f native/MainActivity.kt ] && [ -f native/AdHelper.kt ] || { echo "ERROR: native/ folder files missing (shim.js, MainActivity.kt, AdHelper.kt)" | tee -a "$L"; exit 1; }
cp native/shim.js "$ASSETS/shim.js"
sed -i '0,/<head>/s//<head><script src="shim.js"><\/script>/' "$ASSETS/index.html"
grep -c 'shim.js' "$ASSETS/index.html" | tee -a "$L"
for MODJS in soundscape.js ads.js extra.js; do
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
  [ "$VIS" = "1" ] || exit 1
  echo "FALLBACK: first build failed, rebuilding without camera features" | tee -a "$L"
  rm -f "$MD/Vision.kt"
  cp native/MainActivity.kt "$MD/MainActivity.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/MainActivity.kt"
  sed -i '/com.google.mlkit/d' "$GR"
  flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"
fi
