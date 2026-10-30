        val ok = Build.VERSION.SDK_INT < 23 ||
            act.checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        if (!ok && ask) {
            try {
                act.requestPermissions(arrayOf(Manifest.permission.CAMERA), 77)
            } catch (e: Exception) {
            }
        }
        reply(id, if (ok) "true" else "false")
    }

    private fun torch(on: Boolean, id: String) {
        try {
            val cm = act.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            var cid: String? = null
            for (c in cm.cameraIdList) {
                val ch = cm.getCameraCharacteristics(c)
                val flash = ch.get(CameraCharacteristics.FLASH_INFO_AVAILABLE)
                val facing = ch.get(CameraCharacteristics.LENS_FACING)
                if (flash == true && facing == CameraCharacteristics.LENS_FACING_BACK) {
                    cid = c
                    break
                }
            }
            if (cid == null) {
                reply(id, "false")
                return
            }
            cm.setTorchMode(cid, on)
            reply(id, "true")
        } catch (e: Exception) {
            reply(id, "false")
        }
    }

    private fun lux(id: String) {
        val sm = act.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val s = sm.getDefaultSensor(Sensor.TYPE_LIGHT)
        if (s == null) {
            reply(id, "-1")
            return
        }
        var done = false
        val l = object : SensorEventListener {
            override fun onSensorChanged(e: SensorEvent) {
                if (done) return
                done = true
                sm.unregisterListener(this)
                reply(id, e.values[0].toString())
            }

            override fun onAccuracyChanged(s: Sensor?, a: Int) {}
        }
        sm.registerListener(l, s, SensorManager.SENSOR_DELAY_NORMAL)
        Handler(Looper.getMainLooper()).postDelayed({
            if (!done) {
                done = true
                sm.unregisterListener(l)
                reply(id, "-1")
            }
        }, 1500)
    }

    private fun decode(b64: String): Bitmap? {
        return try {
            val b = Base64.decode(b64, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(b, 0, b.size)
        } catch (e: Exception) {
            null
        }
    }

    private fun scan(b64: String, mask: Int, id: String) {
        val bmp = decode(b64)
        if (bmp == null || mask == 0) {
            reply(id, "{}")
            return
        }
        val img = InputImage.fromBitmap(bmp, 0)
        val out = JSONObject()
        var left = 0
        if (mask and 1 != 0) left++
        if (mask and 2 != 0) left++
        if (mask and 8 != 0) left++
        val finish = {
            left--
            if (left == 0) reply(id, out.toString())
        }
        if (mask and 1 != 0) {
            recognizer.process(img)
                .addOnSuccessListener { t ->
                    val arr = JSONArray()
                    val lines = JSONArray()
                    for (b in t.textBlocks) {
                        for (l in b.lines) {
                            lines.put(l.text)
                            for (el in l.elements) {
                                val r = el.boundingBox
                                arr.put(JSONObject().put("t", el.text).put("h", if (r != null) r.height() else 0))
                            }
                        }
                    }
                    out.put("items", arr)
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
    }
}
