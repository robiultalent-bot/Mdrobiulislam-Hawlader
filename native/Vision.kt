                                    .put("n", cats[0].categoryName())
                                    .put("c", cats[0].score().toDouble())
                                    .put("x", r.centerX().toDouble() / bw)
                                    .put("w", r.width().toDouble() / bw)
                                    .put("h", r.height().toDouble() / bh)
                            )
                        }
                    }
                } catch (e: Throwable) {
                }
                act.runOnUiThread {
                    out.put("objs", arr)
                    finish()
                }
            }.start()
        }
        //OBJ-END
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
