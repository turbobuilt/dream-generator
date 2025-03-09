import 'dart:io';

import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../main.dart';
import '../views/display_all_images_view.dart';
import '../views/main_view/main_view.dart';
import 'network_helper.dart';

updateReviewCredits() async {
  try {
    final response = await getRequest("/api/left-review");
    double creditsRemaining = double.tryParse((response.result["creditsRemaining"] ?? 0).toString()) ?? 0;
    globalAuthenticatedUser.creditsRemaining = creditsRemaining;
    print("credits remaining is");
    print(creditsRemaining);
    globalStore.saveUserData();
    mainViewState.update();
  } catch (error) {
    print("Error updating left review");
    print(error);
  }
}

Future<bool> tryShowRequestRatingModal({ minImagesCount = 4 }) async {
  final context = router.configuration.navigatorKey.currentContext!;
  var showsReviewPrompt = false;
  final imagesCount = globalDisplayAllImagesViewStore.imagePaths.length;
  // const minImagesCount = 4;
  print("checking");

  if ((Platform.isIOS && imagesCount == minImagesCount && globalAuthenticatedUser.creditsRemaining > 1) ||
      (Platform.isAndroid && imagesCount == minImagesCount)) {

    final InAppReview inAppReview = InAppReview.instance;
    final preferences = await SharedPreferences.getInstance();
    // preferences.setInt("reviewPromptCount", 0);
    // preferences.setInt("reviewPromptCount", 0);
    final reviewPromptCount = preferences.getInt("reviewPromptCount") ?? 0;
    if (reviewPromptCount < 1) {
      if (await inAppReview.isAvailable()) {
        preferences.setInt("reviewPromptCount", reviewPromptCount + 1);
        // print("showing review request");
        // inAppReview.requestReview();
        // return true;
        // ignore: use_build_context_synchronously
        if (context.mounted == false) {
          return false;
        }
        // ignore: use_build_context_synchronously
        await showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              // title: const Text("While your waiting..."),
              title: const Text("Help Us Grow!"),
              actionsAlignment: MainAxisAlignment.spaceBetween,
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text("Would you consider giving the app a great rating in the ${Platform.isAndroid ? "Play Store" : "App Store"}?"),
                  const SizedBox(height: 10),
                  const Text("If you leave a 5 star review, you will help me get to the top!"),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    router.pop();
                  },
                  child: const Text("Not Yet"),
                ),
                ElevatedButton(
                  onPressed: () async {
                    showsReviewPrompt = true;
                    inAppReview.requestReview();
                    await updateReviewCredits();
                    router.pop();
                  },
                  child: const Text("Rate"),
                ),
              ],
            );
          },
        );
      }
    }
  }
  return showsReviewPrompt;
}
