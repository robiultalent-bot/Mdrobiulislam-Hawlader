package PKG_PLACEHOLDER

import android.app.Activity
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.OnUserEarnedRewardListener
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

class AdHelper(private val act: Activity, private val reply: (String, String) -> Unit) {
    private var rewarded: RewardedAd? = null
    private var loading = false
    private val waiters = ArrayList<String>()

    fun init() {
        try {
            MobileAds.initialize(act) {}
        } catch (e: Exception) {
        }
    }

    private fun flush(result: String) {
        val list = ArrayList(waiters)
        waiters.clear()
        for (w in list) {
            reply(w, result)
        }
    }

    fun load(unit: String, id: String) {
        if (rewarded != null) {
            reply(id, "true")
            return
        }
        if (unit.isEmpty()) {
            reply(id, "\"E1\"")
            return
        }
        waiters.add(id)
        if (loading) return
        loading = true
        try {
            RewardedAd.load(act, unit, AdRequest.Builder().build(), object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewarded = ad
                    loading = false
                    flush("true")
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    rewarded = null
                    loading = false
                    flush("\"E" + error.code + "\"")
                }
            })
        } catch (e: Exception) {
            loading = false
            flush("\"E0\"")
        }
    }

    fun show(id: String, before: () -> Unit) {
        val ad = rewarded
        if (ad == null) {
            reply(id, "false")
            return
        }
        rewarded = null
        var earned = false
        before()
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                reply(id, if (earned) "true" else "false")
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                reply(id, "false")
            }
        }
        try {
            ad.show(act, OnUserEarnedRewardListener { earned = true })
        } catch (e: Exception) {
            reply(id, "false")
        }
    }
}
