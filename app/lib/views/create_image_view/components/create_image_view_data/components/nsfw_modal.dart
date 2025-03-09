import 'package:dev/controllers/create_image_view_controller.dart';
import 'package:dev/main.dart';
import 'package:dev/views/create_image_view/components/create_image_view_data/create_image_view_data.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../../helpers/router.dart';

showOpenWebAppDialog(BuildContext context, String prompt, String model) async {
  router.pop();
  // open in browser dreamgenerator.ai?token=${globalStore.userToken}
  final encodedPrompt = Uri.encodeComponent(prompt);
  final url = 'https://dreamgenerator.ai/app/?token=${globalStore.userToken}&prompt=$encodedPrompt&model=${Uri.encodeComponent(model)}';
  final uri = Uri.parse(url);
  if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
    // alert failure
    final addErrorDialog = await showDialog(
      context: context!,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Failed to open browser"),
          actionsAlignment: MainAxisAlignment.spaceBetween,
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("We could not open the browser. Please try again."),
              SizedBox(height: 10),
              Text("You can also copy the link and paste it in your browser."),
              SizedBox(height: 5),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                router.pop();
              },
              child: const Text("Ok"),
            ),
          ],
        );
      },
    );
  }
}

tryShowNsfwFlagModal(
    CreateImageViewData createImageViewData, BuildContext context, StatusResult result, String prompt, String model, String style) async {
  if (result.code == "nsfw") {
    // show dialog letting them know they only get a few free images a day.  They can get more HIGH QUALITY images by subscribing or sharing with friends
    final addErrorDialog = await showDialog(
      context: context!,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Potential Problem"),
          actionsAlignment: MainAxisAlignment.spaceBetween,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("This image has been marked as non compliant with Google Play standards."),
              const SizedBox(height: 10),
              // In flutter I want to do equivalent of "click <a href"...">here</a> to do ..." how?
              RichText(
                  text: TextSpan(
                style: const TextStyle(color: Colors.black),
                children: [
                  const TextSpan(text: "Click "),
                  TextSpan(
                    text: "here",
                    style: const TextStyle(
                      color: Colors.blue,
                      decoration: TextDecoration.underline,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () {
                        showOpenWebAppDialog(context, prompt, model);
                      },
                  ),
                  const TextSpan(text: " if you still want to generate this image"),
                ],
              )),

              // const Text("Click "),
              // GestureDetector(
              //   onTap: () => showOpenWebAppDialog(context),
              //   child: const Text("here"),
              // ),
              // const Text(" if you still want to generate this image"),

              // Text("Google Play has strict content standards, and this may go against Google Play standards"),
              const SizedBox(height: 10),
              // Text("If you would like to generate it anyway, go dreamgenerator.ai."),
              // SizedBox(height: 10),
              // Text("We want to respect Google, but also allow you to make whatever you want, as long as it's legal."),
              // SizedBox(height: 10),
              // // Text("Make sure you use good judgement"),
              // SizedBox(height: 5),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                router.pop();
              },
              child: const Text("Ok"),
            ),
            // ElevatedButton(
            //   onPressed: () {},
            //   child: const Text("Go Online"),
            // ),
          ],
        );
      },
    );
    createImageViewData.processing = false;
    createImageViewData.error = "";
    createImageViewData.notifyListeners();
    return true;
  }
  return false;
}
