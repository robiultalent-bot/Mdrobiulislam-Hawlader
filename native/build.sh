  cp native/MainActivity.kt "$MD/MainActivity.kt"
  sed -i "s/PKG_PLACEHOLDER/$PK/" "$MD/MainActivity.kt"
  sed -i '/com.google.mlkit/d' "$GR"
  flutter build apk --release --no-shrink -t "$M" 2>&1 | tee -a "$L"
fi
