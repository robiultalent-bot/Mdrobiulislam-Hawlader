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
