import 'dart:async';
import 'dart:io';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AdManager {
  static get adsEnabled {
    return (globalAuthenticatedUser.plan == null || globalAuthenticatedUser.plan == "");
  }

  static DateTime lastAdLoad = DateTime.now();
  static var lastAdView = DateTime.now().millisecondsSinceEpoch;
  static InterstitialAd? interstitialAd;
  static var numInterstitialLoadAttempts = 0;
  static var maxFailedLoadAttempts = 15;

  static initAds() async {
    if (adsEnabled && interstitialAd == null) {
      createInterstitialAd();
    }
    // reload ad every 15 minutes with a timer
    Timer.periodic(const Duration(minutes: 15), (timer) {
      if (DateTime.now().difference(lastAdLoad).inMinutes > 15) {
        numInterstitialLoadAttempts = 0;
        createInterstitialAd();
      }
    });
  }

  static void hideInterstitialAd() {
    if (interstitialAd != null) {
      interstitialAd!.dispose();
      interstitialAd = null;
      createInterstitialAd();
    }
  }

  static void showInterstitialAdIfAppropriate() async {
    if (!adsEnabled) {
      return;
    }
    if (lastAdView < 5000) {
      print("not showing ad because last ad was less than 5 seconds ago");
      return;
    }
    lastAdView = DateTime.now().millisecondsSinceEpoch;
    var sharedPreferences = await SharedPreferences.getInstance();
    sharedPreferences.setInt("lastAdView", lastAdView).catchError((error) {
      print("Error setting lastAdView");
      print(error);
    });
    print("showing ad");
    // await createInterstitialAd();
    if (interstitialAd == null) {
      print('Warning: attempt to show interstitial before loaded.');
      createInterstitialAd();
      return;
    }
    interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdShowedFullScreenContent: (InterstitialAd ad) {
        print('$ad onAdShowedFullScreenContent.');
        // ad.dispose();
        // createInterstitialAd();
      },
      onAdDismissedFullScreenContent: (InterstitialAd ad) {
        print('$ad onAdDismissedFullScreenContent.');
        ad.dispose();
        createInterstitialAd();
      },
      onAdFailedToShowFullScreenContent: (InterstitialAd ad, AdError error) {
        print('$ad onAdFailedToShowFullScreenContent: $error');
        ad.dispose();
        createInterstitialAd();
      },
      onAdImpression: (ad) {
        postRequest("/api/ad-impression", {"type": "intersitial", "adUnitId": ad.adUnitId}).catchError((error) {
          print("Error sending ad impression");
          print(error);
          facebookAppEvent.logAdImpression(adType: "interstitial");
          ad.onPaidEvent = (ad, valueMicros, precision, currencyCode) {
            print("onPaidEvent");
            print(ad);
            print(valueMicros);
            print(precision);
            print(currencyCode);
            facebookAppEvent.logEvent(
              name: "adPaid",
              parameters: {
                "adUnitId": ad.adUnitId,
                "valueMicros": valueMicros,
                "precision": precision,
                "currencyCode": currencyCode,
              },
            );
          };
        });
      },
    );
    interstitialAd!.show();
    interstitialAd = null;
  }

  static Future<void> createInterstitialAd() async {
    print("trying to load google ad");
    lastAdLoad = DateTime.now();
    Completer<void> completer = Completer<void>();

    InterstitialAd.load(
      adUnitId: Platform.isAndroid ? 'ca-app-pub-5134357171537179/2022196558' : 'ca-app-pub-5134357171537179/7910512433',
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (InterstitialAd ad) {
          print('$ad loaded');
          interstitialAd = ad;
          numInterstitialLoadAttempts = 0;
          interstitialAd!.setImmersiveMode(false);
          completer.complete();
        },
        onAdFailedToLoad: (LoadAdError error) async {
          print('InterstitialAd failed to load: $error.');
          numInterstitialLoadAttempts += 1;
          interstitialAd = null;
          completer.complete();
          // if (numInterstitialLoadAttempts < maxFailedLoadAttempts) {
          //   await Future.delayed(const Duration(seconds: 5));
          //   await createInterstitialAd();
          // } else {
          //   completer.completeError(error);
          // }
        },
      ),
    );
    return completer.future;
  }
}
