//importing the required libraries,
import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../helpers/push_notification_popup.dart';

class TermsAndConditionsView extends StatefulWidget {
  @override
  _TermsAndConditionsViewState createState() => _TermsAndConditionsViewState();
}

class PrivacyTermsWebviewController extends WebViewController {
  PrivacyTermsWebviewController() {
    // use dio load "https://dreamgenerator.ai/terms" and privacy concurrently, concatenate, then show
    loadInfo();
    checkUploadPushToken();
  }

  checkUploadPushToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    try {
      final pushTokenUploaded = prefs.getBool("pushTokenUploaded") ?? false;
      if (pushTokenUploaded) {
        return;
      }
      prefs.setBool("pushTokenUploaded", true);
      final pushNotificationToken = prefs.getString("pushNotificationToken");
      if (pushNotificationToken != null) {
        PushNotificationPopup.submitPushNotificationToken(pushNotificationToken);
      }
    } catch (error) {
      print("error saving push notification token");
      print(error);
    }
  }

  loadInfo() async {
    var responseList = await Future.wait([
      Dio().get("https://dreamgenerator.ai/terms"),
      Dio().get("https://dreamgenerator.ai/privacy"),
    ]);

    var terms = responseList[0].data;
    var privacy = responseList[1].data;
    loadHtmlString(terms + privacy);
  }
}

class _TermsAndConditionsViewState extends BetterState<TermsAndConditionsView> {
  bool agrees = false;
  String error = '';

  void agreesChanged(bool? value) async {
    update(() {
      agrees = value!;
    });
    print("Agrees $value");
    if (value == true) {
      final err = await globalStore.userAgreesToTerms();
      if (err == null) {
        router.replace("/home");
        // Navigator.pop(context)
      } else {
        update(() => error = err);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox(
        height: MediaQuery.of(context).size.height,
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            Container(
                // background gradient left to right blue to purple
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Colors.blue, Colors.purple],
                  ),
                ),
                child: AppBar(title: const Text('Get Started ASAP!'))),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: <Widget>[
                    const Text(
                      "Hi, Welcome to the App!",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "Before we get started, we just want to make one thing clear.  I can't afford to give a bunch of credits away free because it's expensive. One day it will be cheap, but for now it's costs a lot.",
                      style: TextStyle(fontSize: 15),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "No making fake accounts to get free credits! That's it.",
                      style: TextStyle(fontSize: 18),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Checkbox(value: agrees, visualDensity: VisualDensity.compact, onChanged: agreesChanged),
                        GestureDetector(
                            onTap: () => agreesChanged(!agrees), child: const Text("I won't make extra accounts", style: TextStyle(fontSize: 18))),
                      ],
                    ),

                    if (error.isNotEmpty) ...{
                      const SizedBox(height: 20),
                      Text(
                        error,
                        style: const TextStyle(color: Colors.red, fontSize: 18),
                      ),
                    },
                    // scroll view containing 2 webviews to https://dreamgenerator.ai/terms and then https://dreamgenerator.ai/privacy
                    // Expanded(
                    //   child: Column(
                    //     children: [
                    const SizedBox(height: 20),
                    // Text("Term and Privacy (Sequential)"),
                    Expanded(child: WebViewWidget(controller: PrivacyTermsWebviewController())),
                    // SizedBox(height: 20),
                    // Text("Privacy"), // "https://dreamgenerator.ai/terms"
                    // WebViewWidget(controller: PrivacyTermsWebviewController("https://dreamgenerator.ai/privacy")),
                    //     ],
                    //   ),
                    // ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
