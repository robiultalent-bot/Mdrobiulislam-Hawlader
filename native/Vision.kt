                    out.put("lines", lines)
                    finish()
                }
                .addOnFailureListener { finish() }
        }
        if (mask and 2 != 0) {
            val w = bmp.width.toDouble()
            val h = bmp.height.toDouble()
            faceDet.process(img)
                .addOnSuccessListener { list ->
                    val arr = JSONArray()
                    for (f in list) {
                        val r = f.boundingBox
                        arr.put(
                            JSONObject()
                                .put("x", r.centerX() / w)
                                .put("y", r.centerY() / h)
                                .put("w", r.width() / w)
                        )
                    }
                    out.put("faces", arr)
                    finish()
                }
                .addOnFailureListener { finish() }
        }
        if (mask and 8 != 0) {
            barcodes.process(img)
                .addOnSuccessListener { list ->
                    val arr = JSONArray()
                    for (b in list) {
                        val v = b.rawValue
                        if (v != null) arr.put(v)
                    }
                    out.put("codes", arr)
                    finish()
                }
                .addOnFailureListener { finish() }
        }
        if (mask and 16 != 0) {
            val zones = JSONObject()
            val keys = arrayOf("L", "C", "R")
            val cw = bmp.width / 3
            var zl = 3
            for (i in 0..2) {
                var crop: Bitmap? = null
                try {
                    crop = Bitmap.createBitmap(bmp, i * cw, 0, cw, bmp.height)
                } catch (e: Exception) {
                }
                if (crop == null) {
                    zl--
                    if (zl == 0) {
                        out.put("scene", zones)
                        finish()
                    }
                    continue
                }
                labeler.process(InputImage.fromBitmap(crop, 0))
                    .addOnSuccessListener { list ->
                        val arr = JSONArray()
                        for (l in list) {
                            arr.put(JSONObject().put("t", l.text).put("c", l.confidence.toDouble()))
                        }
                        zones.put(keys[i], arr)
                        zl--
                        if (zl == 0) {
                            out.put("scene", zones)
                            finish()
                        }
                    }
                    .addOnFailureListener {
                        zl--
                        if (zl == 0) {
                            out.put("scene", zones)
                            finish()
                        }
                    }
            }
        }
    }
}
