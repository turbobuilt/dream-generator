import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:dev/lib/ads.dart';
import 'package:dev/lib/ads_2.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/main.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/upgrade_modal/upgrade_modal.dart';
import 'package:dev/views/upscale/display_upscaled_image_view.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

String generateGuid() {
  final random = Random();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return List.generate(8, (index) => chars[random.nextInt(chars.length)]).join();
}

class RemoveImageBackgroundViewStore extends BetterChangeNotifier {
  FileImage? image;
  var buttonPadding = 10;
  var generating = false;
  var error = "";
  var status = "";
  var cancel = false;
  // var adManager = AdManager();

  void showImagePicker(context) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      image = FileImage(File(pickedFile.path));
      startGenerating(context);
      notifyListeners();
    }
  }

  startGenerating(BuildContext context) async {
    generating = true;
    error = "";
    cancel = false;
    notifyListeners();

    // get image dimensions
    final imageBytes = await image!.file.readAsBytes();

    if (error != "") {
      generating = false;
      image = null;
      notifyListeners();
      return;
    }

    if (globalAuthenticatedUser.creditsRemaining < 1) {
      generating = false;
      notifyListeners();
      // setTab(Views.purchasesView);
      if (context.mounted) {
        tryShowOutOfCreditsModal(context, false);
      }
      return;
    }
    AdManager.showInterstitialAdIfAppropriate();

    final formData = FormData.fromMap({
      "image": MultipartFile.fromBytes(imageBytes, filename: "image"),
    });
    Response<dynamic>? response; //Response<dynamic>(requestOptions: RequestOptions(path: ""));
    try {
      print("submitting image");
      var cancelToken = CancelToken();
      var responsePromise = dio.post(
        "$apiOrigin/api/submit-remove-image-background",
        data: formData,
        cancelToken: cancelToken,
        options: Options(
          headers: {
            "authorizationtoken": globalStore.userToken,
          },
          responseType: ResponseType.bytes,
        ),
      );
      Timer(const Duration(seconds: 60), () {
        if (response != null) return;
        cancelToken.cancel("timeout");
      });
      response = await responsePromise;
    } on DioException catch (mainError) {
      try {
        // check if timeout
        if (mainError.type == DioExceptionType.cancel) {
          error = "This is taking longer than expected, so the request was cancelled. Please try again. If it happens again, contact support@dreamgnerator.ai";
          generating = false;
          image = null;
          notifyListeners();
          return;
        }

        // get text from resposne
        var errorMessage = mainError.response?.data["error"];
        // and is string
        if (errorMessage != null && errorMessage is String && errorMessage.isNotEmpty) {
          error = errorMessage;
          generating = false;
          image = null;
          notifyListeners();
          return;
        }
      } catch (mainError) {
        print(mainError);
        error = "Could not generate image $mainError";
        image = null;
        generating = false;
        notifyListeners();
        return;
      }
    } catch (mainError) {
      print(mainError);
      error = "Could not generate image $mainError";
      image = null;
      generating = false;
      notifyListeners();
      return;
    }

    //check if response content type starts with image
    if (response?.headers["content-type"] != null && response?.headers["content-type"]?.first.startsWith("image") == true) {
      var exten = response?.headers["content-type"]?.first.split("/").last;
      if (exten == "jpeg") {
        exten = "jpg";
      }
      globalStore.imageName = "${generateGuid()}.$exten";
      // response.data is a binary string. It needs to be converted to Uint8List
      var imageBytes = response?.data;
      globalStore.currentImageData = CurrentImageData(globalStore.imageName, "", "None", imageBytes: imageBytes);
      var creditsRemaining = double.tryParse(response?.headers["x-credits-remaining"]?.first ?? "");
      if (creditsRemaining != null) {
        globalAuthenticatedUser.creditsRemaining = creditsRemaining;
        mainViewState.update();
      }

      // globalStore.currentImageData?.save();
      if (!context.mounted) return;
      showCupertinoModalBottomSheet(
          context: context, duration: const Duration(milliseconds: 300), expand: true, builder: (context) => DisplayUpscaledImageView());
      generating = false;
      error = "";
      image = null;
      notifyListeners();
      return;
    }

    // check if response is json
    // convert body bytes to string and parse json
    try {
      var responseString = utf8.decode(response?.data.codeUnits);
      response = Response(data: jsonDecode(responseString), requestOptions: RequestOptions(path: ""));
    } catch (mainError) {
      print(mainError);
      error = "Could not generate image $mainError";
      image = null;
      generating = false;
      notifyListeners();
      return;
    }

    if (response.data.containsKey("code") && response.data["code"].contains("insufficient_credits")) {
      generating = false;
      notifyListeners();
      customTabBarState.setTab(Views.purchasesView);
      image = null;
      return;
    }
    if (response.data["error"] != null) {
      print("error ${response.data["error"]}");
      error = response.data["error"];
      generating = false;
      image = null;
      notifyListeners();
      return;
    }
  }

  update() {
    notifyListeners();
  }
}

var removeBackgroundState = RemoveImageBackgroundViewStore();
