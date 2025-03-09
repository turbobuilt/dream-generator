import 'dart:async';
import 'dart:io';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AdManger extends StatefulWidget {
  final AdMangerState state;

  AdManger(this.state);

  @override
  AdMangerState createState() => state;
}


class AdMangerState extends BetterState<AdManger> {
  @override
  void initState() {
    super.initState();
    initAds();
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }

  get adsEnabled {
    return (globalAuthenticatedUser.plan == null || globalAuthenticatedUser.plan == "");
  }

  DateTime lastAdLoad = DateTime.now();
  var lastAdView = DateTime.now().millisecondsSinceEpoch;
  InterstitialAd? interstitialAd;
  var numInterstitialLoadAttempts = 0;
  var maxFailedLoadAttempts = 15;

  initAds() async {
    await MobileAds.instance.initialize();
    print("ads enable $adsEnabled");
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

  void hideInterstitialAd() {
    if (interstitialAd != null) {
      interstitialAd!.dispose();
      interstitialAd = null;
      createInterstitialAd();
    }
  }

  void showInterstitialAdIfAppropriate() async {
    if (!adsEnabled) {
      print("not showing ad because ads are disabled");
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
    if (interstitialAd == null) {
      print('Warning: attempt to show interstitial before loaded.');
      createInterstitialAd();
      return;
    }
    interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdShowedFullScreenContent: (InterstitialAd ad) {
        // ad.dispose(),
        // // reload new ad
        // createInterstitialAd(),
        print('ad onAdShowedFullScreenContent.');
        print(ad);
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

  void createInterstitialAd() async {
    print("trying to load google ad");
    lastAdLoad = DateTime.now();
    await InterstitialAd.load(
      adUnitId: Platform.isAndroid
          ? 'ca-app-pub-5134357171537179/2022196558'
          : 'ca-app-pub-5134357171537179/7910512433', //' 'ca-app-pub-3940256099942544/4411468910',
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (InterstitialAd ad) {
          print('$ad loaded');
          interstitialAd = ad;
          numInterstitialLoadAttempts = 0;
          interstitialAd!.setImmersiveMode(false);
        },
        onAdFailedToLoad: (LoadAdError error) async {
          print('InterstitialAd failed to load: $error.');
          numInterstitialLoadAttempts += 1;
          interstitialAd = null;
          if (numInterstitialLoadAttempts < maxFailedLoadAttempts) {
            // wait 5 seconds
            await Future.delayed(const Duration(seconds: 5));
            createInterstitialAd();
          }
        },
      ),
    );
  }
}
