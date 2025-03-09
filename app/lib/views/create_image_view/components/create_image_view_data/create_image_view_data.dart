import 'dart:async';
import 'dart:io';

import 'package:dev/lib/ads.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../controllers/create_image_view_controller.dart';
import '../../../../helpers/network_helper.dart';
import '../../../../helpers/request_rating.dart';
import '../../../../main.dart';
import '../../../../modals/not_verified.dart';
import '../../../../models/CurrentImageData.dart';
import '../../../display_output_view/display_output_view.dart';
import '../../../feed_view/feed_view.dart';
import '../../../main_view/main_view.dart';
import '../../../upgrade_modal/upgrade_modal.dart';
import '../../create_image_view.dart';
import 'components/add_failed_upgrade_prompt_modal.dart';
import 'components/nsfw_modal.dart';

class CreateImageViewData extends ChangeNotifier {
  List<String> styleImageNames = ["Anime", "Fantasy Art", "Photorealistic", "3D Model", "Digital Art", "None"];
  bool showInAppPurchase = false;
  String error = '';
  String selectedStyle = 'None';
  bool processing = false;
  String processingStatus = '';
  var promptNotifier = PromptNotifier();
  var minChars = 10;
  int? promptId;
  BuildContext? context;
  var isFirstLoad = false;
  var loadingIap = false;
  var theme = ViewTheme.dark;
  var model = "sdxl";
  // var adMangerState = AdMangerState();

  CreateImageViewData({this.theme = ViewTheme.dark}) {
    SharedPreferences.getInstance().then((prefs) {
      isFirstLoad = prefs.getBool("isFirstLoad") ?? true;
      if (isFirstLoad) {
        prefs.setBool("isFirstLoad", false);
      }
    });
  }

  update() {
    print("updating creat image view");
    notifyListeners();
    print("updated create image view");
  }

  createImage() async {
    if (promptNotifier.prompt.text.length < minChars) {
      error = "Please enter at least $minChars characters.";
      notifyListeners();
      return;
    }

    processing = true;
    error = '';
    notifyListeners();
    // var willUpgrade = await tryShowBasicUpgradeModal(context!); // Android only
    // if (willUpgrade) {
    //   processing = false;
    //   error = '';
    //   notifyListeners();
    //   return;
    // }
    // await tryShowAddFailedUpgradePromptModal(context!, this); // Never Shows.  Why??
    // if (!feedView.forceShowFeed) {
    //   feedView.forceShowFeed = true;
    //   feedView.update();
    // }
    // await tryShowOutOfCreditsModal(context!, false, force: true);
    // return;
    if (globalAuthenticatedUser.creditsRemaining < 1) {
      await tryShowOutOfCreditsModalIfNotSeen(context!, false);
    }

    // get images count
    var showingReviewPrompt = await tryShowRequestRatingModal(minImagesCount: 4);
    final future = createImageButtonPressed(promptNotifier.prompt.text, selectedStyle, model, promptId, (status) {
      processingStatus = status;
      notifyListeners();
    });

    var insufficientCredits = false;
    final numImages = globalDisplayAllImagesViewStore.imagePaths.length;

    AdManager.showInterstitialAdIfAppropriate();
    // if (AdManager.adsEnabled &&
    //     !showingReviewPrompt &&
    //     ((Platform.isAndroid && numImages >= 2) || (Platform.isIOS && globalAuthenticatedUser.creditsRemaining < 1))) {
    //   // show ads after 2 seconds
    //   Future.delayed(const Duration(seconds: 0), () {
    //     if (insufficientCredits) {
    //       return;
    //     }
    //     AdManager.showInterstitialAdIfAppropriate();
    //   });
    // }
    final result = await future;
    if (result.code == "not_verified") {
      // show dialog letting them know they only get a few free images a day.  They can get more HIGH QUALITY images by subscribing or sharing with friends
      await showNotVerifiedModal(context!);
      processing = false;
      error = "";
      notifyListeners();
      return;
    }
    print("result.code ${result.code}");
    if (result.code == "nsfw") {
      await tryShowNsfwFlagModal(this, context!, result, promptNotifier.prompt.text, model, selectedStyle);
      processing = false;
      error = "";
      notifyListeners();
      return;
    } else {
      print("result.code failed ${result.code}");
    }
    // _interstitialAd!.dispose();

    processing = false;
    notifyListeners();
    if (result.code == "free_limit_reached") {
      await tryShowOutOfCreditsModal(context!, false, force: true);
    } else if (result.code == "insufficient_credits") {
      if (showingReviewPrompt) {
        // call again
        createImage();
        return;
      }
      try {
        // adMangerState.hideInterstitialAd();
      } catch (err) {
        print("Error hiding ad");
        print(err);
      }
      globalAuthenticatedUser.creditsRemaining = parseDouble(result.data?["creditsRemaining"] ?? 0);
      insufficientCredits = true;
      if (context?.mounted == true) {
        await tryShowOutOfCreditsModal(context!, true);
      }
      // setTab(Views.purchasesView);
      return;
    } else if (result.error != null) {
      processing = false;
      error = result.error!;
      notifyListeners();
      return;
    } else if (result.url != null) {
      globalStore.imageUrl = result.url!;
      final name = "${result.taskId!}.png";
      final prompt = promptNotifier.prompt.text;
      globalStore.currentImageData = CurrentImageData(name, prompt, selectedStyle, promptId: promptId, model: result.model);
      globalStore.currentImageData?.save();
      promptNotifier.prompt.text = "";
      notifyListeners();

      if (context?.mounted != true) {
        return;
      }

      incrementImagesCount();

      // show cupertino bottom sheet
      await showCupertinoModalBottomSheet(
        context: context!,
        duration: const Duration(milliseconds: 300),
        expand: true,
        // animationCurve: Curves.linear,
        builder: (context) => DisplayOutputView(),
      );
      globalDisplayAllImagesViewStore.loadImagePaths();
      mainViewState.update();
    }
  }

  incrementImagesCount() async {
    var prefs = await SharedPreferences.getInstance();
    var count = prefs.getInt("imagesGeneratedCount") ?? 0;
    count += 1;
    prefs.setInt("imagesGeneratedCount", count);
  }
}
