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
