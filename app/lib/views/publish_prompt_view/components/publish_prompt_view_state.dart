import 'dart:io';

import 'package:dev/models/GenerateAudioRequest.dart';
import 'package:dev/views/display_output_audio_view/components/publish_audio_button/convert_to_opus.dart';
import 'package:dev/views/publish_prompt_view/components/convert_to_mp3.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
// import 'package:flutter_nude_detector/flutter_nude_detector.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../helpers/network_helper.dart';
import '../../../helpers/router.dart';
import '../../../main.dart';

class PublishPromptViewState extends ChangeNotifier {
  var title = TextEditingController();
  var error = "";
  var publishing = false;
  var minLength = 8;
  var localAssetUrl = "";
  var uploadPercent = 0.0;
  var uploading = false;
  var complete = false;
  var showNudityMessage = false;
  var clickToClose = true;
  var totalPercentComplete = 0;
  dynamic share;
  BuildContext? buildContext;

  PublishPromptViewState() {
    print("Createing state");
    title.addListener(() {
      notifyListeners();
    });
  }

  publishAudio(GenerateAudioRequest generateAudioRequest) async {
    publishing = true;
    error = "";
    uploadPercent = 0;
    uploading = false;
    complete = false;
    notifyListeners();

    totalPercentComplete = 10;
    notifyListeners();

    final response = await postRequest("/api/publish-audio", {
      "promptText": generateAudioRequest.prompt,
      "title": title.text,
      "model": generateAudioRequest.model,
      "size": await generateAudioRequest.getFileSize(),
    });

    print("did publish requrest");
    if (response.error != null) {
      publishing = false;
      error = response.error ?? "error";
      totalPercentComplete = 0;
      print("error: $error");
      notifyListeners();
      return;
    }
    final prompt = response.result["prompt"];
    final sharedAudio = response.result["sharedAudio"];
    share = response.result["share"];
    print("not dead");

    generateAudioRequest.shareId = response.result["share"]["id"];
    generateAudioRequest.sharedAudioId = response.result["sharedAudio"]["id"];
    await generateAudioRequest.save();
    totalPercentComplete = 30;

    final uploadUrl = response.result["uploadUrl"];

    // upload image via put with dio
    print(response.result);
    print("upload url $uploadUrl");
    // final formData = FormData.fromMap({
    //   "file": MultipartFile.fromBytes(avifBytes, filename: "image.avif", contentType: MediaType.parse("image/avif")),
    // });

    // String opusedPath = await convertToOpus(await generateAudioRequest.getLocalPath());
    String mp3Path = await convertToMp3(await generateAudioRequest.getLocalPath());

    // Create a File object
    File file = File(mp3Path);
    // Read the file as bytes
    List<int> fileBytes = await file.readAsBytes();

    var data;
    try {
      print("starting upload");
      uploading = true;
      final uploadResponse =
          await dio.put(uploadUrl, data: fileBytes, options: Options(contentType: "audio/mp3"), onSendProgress: (int sent, int total) {
        print("sent $sent of $total");
        uploadPercent = sent / total * 100;
        totalPercentComplete = 30 + (uploadPercent * 0.7).toInt();
        notifyListeners();
      });
      print("upload response");
      print(uploadResponse);
      data = uploadResponse.data;
    } catch (e) {
      print("error uploading image");
      print(e);
      error = "Error uploading image $e";
      publishing = false;
      return;
    } finally {
      uploading = false;
      notifyListeners();
    }

    final result = await putRequest("/api/shared-audio/${sharedAudio["id"]}", {
      "uploaded": true,
    });
    if (result.error != null) {
      error = result.error ?? "error";
      print("error completing please contact developer: $error");
      publishing = false;
      notifyListeners();
      return;
    }

    final sharedPreferences = await SharedPreferences.getInstance();
    clickToClose = sharedPreferences.getBool("clickToClose") ?? true;
    sharedPreferences.setBool("clickToClose", false);

    complete = true;
    publishing = false;
    totalPercentComplete = 100;
    notifyListeners();
  }

  publish() async {
    // if (title.text.length < minLength) {
    //   error = "Title must be at least $minLength characters";
    //   notifyListeners();
    //   return;
    // }
    print("starting publish in publish prompt view");
    // print stack trace
    print(StackTrace.current);
    publishing = true;
    error = "";
    uploadPercent = 0;
    uploading = false;
    complete = false;
    notifyListeners();

    // var stopwatch = Stopwatch()..start();
    // final hasNudity = await FlutterNudeDetector.detect(path: localImageUrl, threshold: .8);
    bool hasNudity = false;
    print("has nudity: $hasNudity");
    // stopwatch.stop();
    // final elapsedSeconds = stopwatch.elapsedMilliseconds / 1000;
    // print('Nude detection took $elapsedSeconds');
    // if (hasNudity) {
    //   error = "Nudity can't be published right now.";
    //   publishing = false;
    //   notifyListeners();
    //   return;
    // }
    // print("has nudity $)
    totalPercentComplete = 5;
    notifyListeners();

    print("encoding avif");
    Stopwatch timer = Stopwatch()..start();
    final imageBytes = await File(localAssetUrl).readAsBytes();
    final avifBytes = await encodeAvif(imageBytes);
    print('doSomething() executed in ${timer.elapsed}');

    totalPercentComplete = 10;
    notifyListeners();

    final response = await postRequest("/api/publish-prompt", {
      "prompt": globalStore.currentImageData?.prompt,
      "title": title.text,
      "style": globalStore.currentImageData?.style,
      "model": globalStore.currentImageData?.model,
      "imageSize": avifBytes.length,
      "hasNudity": hasNudity,
      // "nudityDetected": hasNudity,
    });
    print("did publish");
    if (response.error != null) {
      publishing = false;
      error = response.error ?? "error";
      totalPercentComplete = 0;
      print("error: $error");
      notifyListeners();
      return;
    }
    final prompt = response.result["prompt"];
    final sharedImage = response.result["sharedImage"];
    share = response.result["share"];
    print("not dead");

    globalStore.currentImageData?.promptId = prompt["id"];
    globalStore.currentImageData?.isOwnPrompt = true;
    globalStore.currentImageData?.save();
    totalPercentComplete = 30;

    showNudityMessage = false;
    // var nudityDialogOpen = true;
    if (sharedImage["nudity"] == 1) {
      showNudityMessage = true;
      // show alert dialog letting them know that it is only published online
      // if (buildContext?.mounted == true) {
      //   showDialog(
      //     context: buildContext!,
      //     builder: (BuildContext context) {
      //       return AlertDialog(
      //         title: const Text("Nudity Only Published Online"),
      //         content: const Text(
      //             "This image contains nudity and can't be published in apps.  It will be available online only right now to comply with App Store policies. We apologize for the issue, hopefully it will be fixed soon. I don't know why people hate nudity so much, it's not like people aren't animals too, in the sense that we also have bodies."),
      //         actions: [
      //           TextButton(
      //             onPressed: () {
      //               router.pop();
      //               if (complete) {
      //                 // after 2 seconds, router.pop again
      //                 Future.delayed(const Duration(seconds: 1)).then((value) => router.pop(share));
      //               }
      //             },
      //             child: const Text("Ok"),
      //           ),
      //         ],
      //       );
      //     },
      //   ).then((value) => nudityDialogOpen = false);
      // }
    }

    final uploadUrl = response.result["uploadUrl"];

    // upload image via put with dio
    print(response.result);
    print("upload url $uploadUrl");
    // final formData = FormData.fromMap({
    //   "file": MultipartFile.fromBytes(avifBytes, filename: "image.avif", contentType: MediaType.parse("image/avif")),
    // });
    var data;
    try {
      print("starting upload");
      uploading = true;
      final uploadResponse =
          await dio.put(uploadUrl, data: avifBytes, options: Options(contentType: "image/avif"), onSendProgress: (int sent, int total) {
        print("sent $sent of $total");
        uploadPercent = sent / total * 100;
        totalPercentComplete = 30 + (uploadPercent * 0.7).toInt();
        notifyListeners();
      });
      print("upload response");
      print(uploadResponse);
      data = uploadResponse.data;
    } catch (e) {
      print("error uploading image");
      print(e);
      error = "Error uploading image $e";
      publishing = false;
      return;
    } finally {
      uploading = false;
      notifyListeners();
    }

    final result = await putRequest("/api/shared-image/${sharedImage["id"]}", {
      "uploaded": true,
    });
    if (result.error != null) {
      error = result.error ?? "error";
      print("error completing please contact developer: $error");
      publishing = false;
      notifyListeners();
      return;
    }

    final sharedPreferences = await SharedPreferences.getInstance();
    clickToClose = sharedPreferences.getBool("clickToClose") ?? true;
    sharedPreferences.setBool("clickToClose", false);

    complete = true;
    publishing = false;
    totalPercentComplete = 100;
    notifyListeners();
  }
}
