import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/ads.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/upgrade_modal/upgrade_modal.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_size_getter/image_size_getter.dart' as image_size_getter;
import 'package:dev/controllers/create_image_view_controller.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_size_getter/image_size_getter.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:fast_image_resizer/fast_image_resizer.dart';
import 'dart:math';

import 'display_upscaled_image_view.dart';

String generateGuid() {
  final random = Random();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return List.generate(8, (index) => chars[random.nextInt(chars.length)]).join();
}

class UpscaleImageViewStore extends ChangeNotifier {
  FileImage? image;
  var buttonPadding = 10;
  var generating = false;
  var error = "";
  var status = "";
  var cancel = false;
  var scaleFactor = 4;
  // var adMangerState = AdMangerState();

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
    // takes ImageINput
    const minSize = 256;
    const maxSize = 2048;
    try {
      final imageSize = ImageSizeGetter.getSize(MemoryInput(imageBytes));
      if (imageSize.width < minSize) {
        error = "Image width must be at least $minSize pixels. Image width is ${imageSize.width}";
      } else if (imageSize.height < minSize) {
        error = "Image height must be at least $minSize pixels. Image height is ${imageSize.height}";
      } else if (imageSize.width > maxSize) {
        error = "Image width must be at most $maxSize pixels. Image width is ${imageSize.width}";
      } else if (imageSize.height > maxSize) {
        error = "Image height must be at most $maxSize pixels. Image height is ${imageSize.height}";
      } else if (imageSize.width * imageSize.height > 1048576) {
        error = "Image must be less than 1,048,576 pixels";
      }
    } catch (err) {
      print(err);
      error = "Could not get image size $err";
      generating = false;
      image = null;
      notifyListeners();
      return;
    }
    if (error != "") {
      generating = false;
      image = null;
      notifyListeners();
      return;
    }
    // if (globalAuthenticatedUser.creditsRemaining < 1) {
    //   generating = false;
    //   notifyListeners();
    //   // setTab(Views.purchasesView);
    //   if (context.mounted) {
    //     tryShowOutOfCreditsModal(context, false);
    //   }
    //   return;
    // }
    AdManager.showInterstitialAdIfAppropriate();

    final formData = FormData.fromMap({
      "image": MultipartFile.fromBytes(imageBytes, filename: "image"),
    });
    Response<dynamic> response = Response<dynamic>(requestOptions: RequestOptions(path: ""));
    try {
      print("submitting image");
      response = await dio.post(
        "$apiOrigin/api/submit-image-upscale?scaleFactor=$scaleFactor",
        data: formData,
        options: Options(
          headers: {
            "authorizationtoken": globalStore.userToken,
          },
          responseType: ResponseType.bytes,
        ),
      );
    } on DioException catch (mainError) {
      try {
        // get text from resposne
        var error = mainError.response?.data["error"];
        // and is string
        if (error != null && error is String && error.isNotEmpty) {
          this.error = error;
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
    if (response.headers["content-type"] != null && response.headers["content-type"]?.first.startsWith("image") == true) {
      var exten = response.headers["content-type"]?.first.split("/").last;
      if (exten == "jpeg") {
        exten = "jpg";
      }
      globalStore.imageName = "${generateGuid()}.$exten";
      // response.data is a binary string. It needs to be converted to Uint8List
      var imageBytes = response.data;
      globalStore.currentImageData = CurrentImageData(globalStore.imageName, "", "None", imageBytes: imageBytes);
      var creditsRemaining = double.tryParse(response.headers["x-credits-remaining"]?.first ?? "");
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
      var responseString = utf8.decode(response.data.codeUnits);
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

class HideImageStore extends ChangeNotifier {
  var hideImage = false;
  update() {
    notifyListeners();
  }
}

var hideImageStore = HideImageStore();

class UpscaleImageView extends StatefulWidget {
  @override
  UpscaleImageViewState createState() => UpscaleImageViewState();
}

class UpscaleImageViewState extends BetterState<UpscaleImageView> {
  UpscaleImageViewStore? upscaleImageView;

  @override
  void initState() {
    super.initState();
    upscaleImageView = UpscaleImageViewStore();
  }


  @override
  Widget build(BuildContext context) {
    if (upscaleImageView == null) return Container();
    return Container(
      height: double.infinity,
      width: double.infinity,
      padding: const EdgeInsets.all(8),
      color: Colors.white,
      child: ChangeNotifierProvider.value(
        value: upscaleImageView,
        child: Consumer<UpscaleImageViewStore>(
          builder: (context, notifier, child) => Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              const Spacer(),
              const Padding(
                padding: EdgeInsets.all(8.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text("You can increase the resolution of your images and add detail using AI.", textAlign: TextAlign.center),
                    SizedBox(height: 10),
                    Text("You can increase the size by 2x or 4x.", textAlign: TextAlign.center),
                    SizedBox(height: 10),
                    Text("Min input size is 256x256", textAlign: TextAlign.center),
                    SizedBox(height: 10),
                    Text("Max input size is 2048x2048", textAlign: TextAlign.center),
                    SizedBox(height: 10),
                    Text("Pick your image and get started!", textAlign: TextAlign.center)
                  ],
                ),
              ),
              const Spacer(),
              if (upscaleImageView!.generating) ...{
                const SizedBox(height: 50),
                const Center(child: CircularProgressIndicator()),
                const SizedBox(height: 30),
                const Center(child: Text("Takes 15 to 20 seconds, but could be more or less.")),
                const SizedBox(height: 5),
                const Center(child: Text("If it takes a really long time... quit the app and try again!", textAlign: TextAlign.center)),
                const SizedBox(height: 50),
              } else ...{
                if (upscaleImageView!.image == null)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        // select input widget 2x or 4x for scaling
                        DropdownButton(
                            hint: const Text("Size"),
                            items: const [
                              DropdownMenuItem(value: 2, child: Text("2x")),
                              DropdownMenuItem(value: 4, child: Text("4x")),
                            ],
                            onChanged: (value) {
                              if (value is int) {
                                upscaleImageView!.scaleFactor = value;
                              }
                            },
                            value: upscaleImageView!.scaleFactor),

                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              upscaleImageView!.showImagePicker(context);
                            },
                            child: Text(upscaleImageView!.image == null ? "Pick From Photos" : "Pick Other Image"),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (upscaleImageView!.image != null) ...{},
                const SizedBox(height: 7),
              },
              if (upscaleImageView!.error != "") ...{
                const SizedBox(height: 5),
                Text(upscaleImageView!.error, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 10),
                if (upscaleImageView!.generating)
                  ElevatedButton(
                    onPressed: () {
                      upscaleImageView!.cancel = true;
                      upscaleImageView!.update();
                    },
                    child: const Text("Cancel"),
                  ),
              },
            ],
          ),
        ),
      ),
    );
  }
}
