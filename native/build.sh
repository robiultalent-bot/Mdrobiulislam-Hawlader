set -eo pipefail
L="$GITHUB_WORKSPACE/build.log"
P=$(find . -name pubspec.yaml -not -path "*/.*" -not -path "*/build/*" | head -1)
[ -z "$P" ] && echo "ERROR: pubspec.yaml not found" | tee "$L" && ls -R | head -50 | tee -a "$L" && exit 1
cd "$(dirname "$P")"
echo "Project folder: $(pwd)" | tee "$L"
M=$(find lib -iname main.dart 2>/dev/null | head -1)
[ -z "$M" ] && echo "ERROR: lib/main.dart not found" | tee -a "$L" && exit 1
[ -f assets/index.html ] || { echo "ERROR: assets/index.html not found" | tee -a "$L"; exit 1; }
rm -rf android
flutter create --org com.blindtalent --project-name light_of_mind --platforms android .
sed -i -E 's/(minSdk(Version)?[ =]+)flutter\.minSdkVersion/\124/' android/app/build.gradle* || true
MF=android/app/src/main/AndroidManifest.xml
grep -q 'permission.INTERNET' $MF || sed -i 's|<manifest[^>]*>|&<uses-permission android:name="android.permission.INTERNET"/>|' $MF
grep -q 'TTS_SERVICE' $MF || sed -i 's|<manifest[^>]*>|&<queries><intent><action android:name="android.intent.action.TTS_SERVICE"/></intent></queries>|' $MF
grep -q 'permission.CAMERA' $MF || sed -i 's|<manifest[^>]*>|&<uses-permission android:name="android.permission.CAMERA"/><uses-feature android:name="android.hardware.camera" android:required="false"/>|' $MF
APPID="ca-app-pub-5481902015314492~1735182591"
grep -q 'ads.APPLICATION_ID' $MF || python3 - "$MF" "$APPID" <<'MF_PY'
import re,sys
p,a=sys.argv[1],sys.argv[2]
s=open(p,encoding="utf-8").read()
s=re.sub(r'(<application\b[^>]*>)',lambda m:m.group(1)+'<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="'+a+'"/>',s,count=1)
open(p,"w",encoding="utf-8").write(s)
MF_PY
if [ -f android/app/build.gradle ]; then GR=android/app/build.gradle; else GR=android/app/build.gradle.kts; fi
grep -q 'play-services-ads' "$GR" || { case "$GR" in *.kts) printf '\ndependencies {\n    implementation("com.google.android.gms:play-services-ads:23.2.0")\n}\n' >> "$GR";; *) printf "\ndependencies {\n    implementation 'com.google.android.gms:play-services-ads:23.2.0'\n}\n" >> "$GR";; esac; }
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
