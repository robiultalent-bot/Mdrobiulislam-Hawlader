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
