import 'dart:io';

import 'package:dev/lib/ads.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../../helpers/router.dart';
import '../../../../../main.dart';
import '../../../../main_view/components/main_tab_bar.dart';
import '../create_image_view_data.dart';

tryShowAddFailedUpgradePromptModal(BuildContext context, CreateImageViewData createImageViewData) async {
    // if (AdManger.adsEnabled && AdManger.interstitialAd == null && globalAuthenticatedUser.creditsRemaining < .2 && false) {
    //   // show dialog offering user options to upgrade or try later
    //   // let them know ad failed to load
    //   final addErrorDialog = await showDialog(
    //       context: context!,
    //       builder: (BuildContext context) {
    //         return AlertDialog(
    //           title: const Text("Ad failed to load"),
    //           actionsAlignment: MainAxisAlignment.spaceBetween,
    //           content: const Column(
    //             mainAxisSize: MainAxisSize.min,
    //             children: [
    //               Text("This is ad supported.  Because an ad failed to load, we can't afford to show an image if you don't subscribe."),
    //               SizedBox(height: 10),
    //               Text("You can upgrade now and get instant access to high quality images, or you can wait and try again later."),
    //               SizedBox(height: 5),
    //               // Text("Leave a review?", style: TextStyle(fontSize: 18)),
    //             ],
    //           ),
    //           actions: [
    //             TextButton(
    //               onPressed: () {
    //                 router.pop();
    //               },
    //               child: const Text("Try Later"),
    //             ),
    //             ElevatedButton(
    //               onPressed: () {
    //                 router.pop();
    //                 setTab(Views.purchasesView);
    //               },
    //               child: const Text("Upgrade"),
    //             ),
    //           ],
    //         );
    //       });
    //   createImageViewData.processing = false;
    //   createImageViewData.error = '';
    //   createImageViewData.notifyListeners();
    //   AdManger.maxFailedLoadAttempts = 10;
    //   AdManger.numInterstitialLoadAttempts = 0;
    //   AdManger.createInterstitialAd();
    //   return;
    // }
}