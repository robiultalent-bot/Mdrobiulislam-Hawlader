                    try {
                        outFile.delete()
                    } catch (e: Exception) {
                    }
                    if (cancelled || job.level >= 2) {
                        fail(id, exportException.getErrorCodeName() + ": " + (exportException.message ?: ""))
                    } else {
                        job.level += 1
                        main.post { runLevel(job, id) }
                    }
                }
            }
            val t = Transformer.Builder(act).addListener(listener).build()
            transformer = t
            if (useMusic && music != null) {
                val mv = music.optDouble("volume", 0.5).toFloat().coerceIn(0f, 2f)
                val mStart = music.optLong("startMs", 0L)
                val len = if (full) 0L else endMs - startMs
                val mc = MediaItem.ClippingConfiguration.Builder().setStartPositionMs(mStart)
                if (len > 0L) mc.setEndPositionMs(mStart + len)
                val mItem = MediaItem.Builder().setUri(Uri.fromFile(File(music.optString("path"))))
                    .setClippingConfiguration(mc.build()).build()
                val map = ArrayList<AudioProcessor>()
                map.add(volProc(mv))
                val mEdited = EditedMediaItem.Builder(mItem).setRemoveVideo(true)
                    .setEffects(Effects(map, ArrayList<Effect>())).build()
                val comp = Composition.Builder(
                    EditedMediaItemSequence(ImmutableList.of(mainItem)),
                    EditedMediaItemSequence(ImmutableList.of(mEdited))
                ).build()
                t.start(comp, outFile.absolutePath)
            } else {
                t.start(mainItem, outFile.absolutePath)
            }
            poll(t, id)
        } catch (e: Throwable) {
            if (job.level >= 2 || cancelled) {
                fail(id, e.toString())
            } else {
                job.level += 1
                runLevel(job, id)
            }
        }
    }

    private fun poll(t: Transformer, id: String) {
        main.postDelayed(object : Runnable {
            override fun run() {
                if (!busy || transformer !== t) return
                try {
                    val ph = ProgressHolder()
                    val st = t.getProgress(ph)
                    if (st == Transformer.PROGRESS_STATE_AVAILABLE) {
                        js("window.__vedProgress&&window.__vedProgress(" + ph.progress + ")")
                    }
                } catch (e: Throwable) {
                }
                main.postDelayed(this, 600)
            }
        }, 600)
    }

    private fun finishOk(job: Job, out: File, id: String) {
        Thread {
            var uriStr = ""
            val name = "MonerAlo_" + System.currentTimeMillis() + ".mp4"
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    val cv = ContentValues()
                    cv.put(MediaStore.Video.Media.DISPLAY_NAME, name)
                    cv.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
                    cv.put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/MonerAlo")
                    cv.put(MediaStore.Video.Media.IS_PENDING, 1)
                    val r = act.contentResolver
                    val u = r.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, cv)
                    if (u != null) {
                        r.openOutputStream(u)?.use { os -> out.inputStream().use { it.copyTo(os) } }
                        val cv2 = ContentValues()
                        cv2.put(MediaStore.Video.Media.IS_PENDING, 0)
                        r.update(u, cv2, null, null)
                        uriStr = u.toString()
                    }
                } else {
                    val dir = act.getExternalFilesDir(Environment.DIRECTORY_MOVIES)
                    if (dir != null) {
                        dir.mkdirs()
                        val f = File(dir, name)
                        out.copyTo(f, true)
                        uriStr = f.absolutePath
                    }
                }
            } catch (e: Throwable) {
                uriStr = ""
            }
            act.runOnUiThread {
                busy = false
                transformer = null
                val o = JSONObject()
                o.put("ok", true)
                o.put("saved", uriStr.isNotEmpty())
                o.put("uri", uriStr)
                o.put("name", name)
                o.put("path", out.absolutePath)
                o.put("url", "file://" + out.absolutePath)
                o.put("skipped", job.skipped)
                js("window.__vedProgress&&window.__vedProgress(100)")
                reply(id, o.toString())
            }
        }.start()
    }
}
