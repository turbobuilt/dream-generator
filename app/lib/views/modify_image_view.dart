import 'dart:io';
import 'dart:typed_data';

import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_size_getter/image_size_getter.dart' as image_size_getter;
import 'package:dev/controllers/create_image_view_controller.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:fast_image_resizer/fast_image_resizer.dart';

import 'display_output_view/display_output_view.dart';
import 'main_view/components/main_tab_bar.dart';
import 'main_view/main_view.dart';

class SliderModel extends ChangeNotifier {
  double value = 20;
  void update(double newValue) {
    value = newValue;
    notifyListeners();
  }
}

final sliderModel = SliderModel();

final editView = EditImageViewStore();

class EditImageViewStore extends ChangeNotifier {
  FileImage? image;
  var buttonPadding = 10;
  var generating = false;
  var error = "";
  var status = "";
  var prompt = TextEditingController();
  var cancel = false;
  var minChars = 20;

  EditImageViewStore() {
    prompt.addListener(() {
      notifyListeners();
    });
  }

  void showImagePicker() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      image = FileImage(File(pickedFile.path));
      notifyListeners();
    }
  }

  startGenerating(BuildContext context) async {
    if (prompt.text.length < minChars) {
      error = "Please enter at least $minChars characters";
      notifyListeners();
      return;
    }
    generating = true;
    error = "";
    cancel = false;
    notifyListeners();

    final resizedImage = await localResizeImage();
    if (resizedImage == null) {
      generating = false;
      notifyListeners();
      return;
    }

    final formData = FormData.fromMap({
      "prompt": prompt.text,
      "similarity": sliderModel.value.round(),
      "image": MultipartFile.fromBytes(resizedImage.asUint8List(), filename: "image"),
    });
    Response<dynamic> response;
    try {
      print("submitting image");
      response = await dio.post("$apiOrigin/api/submit-image-modify-with-prompt",
          data: formData, options: Options(headers: {"authorizationtoken": globalStore.userToken}));
    } catch (err) {
      print(err);
      error = "Could not generate image$err";
      generating = false;
      notifyListeners();
      return;
    }
    print(response.data);
    if (response.data.containsKey("code") && response.data["code"].contains("insufficient_credits")) {
      generating = false;
      notifyListeners();
      customTabBarState.setTab(Views.purchasesView);
      return;
    }
    if (response.data["error"] != null) {
      print("error" + response.data["error"]);
      error = response.data["error"];
      generating = false;
      notifyListeners();
      return;
    }

    final taskId = response.data["taskId"];
    for (var i = 0; i < 60; i++) {
      if (cancel) {
        generating = false;
        notifyListeners();
        return;
      }
      await Future.delayed(const Duration(seconds: 2));
      final result = await pollStatus(taskId);
      status = result.status;
      notifyListeners();
      if (result.error != null) {
        error = result.error ??
            "error unknown support@dreamgenerator.ai for help.  I don't know what the problem is sorry, will try to fix if you tell me what you did to cause it then I can duplicate it.  Thanks for your help as I improve it!";
        if (status == "Failed") {
          generating = false;
          notifyListeners();
          return;
        } else {
          print(error);
          notifyListeners();
          continue;
        }
      }
      if (result.url != null) {
        generating = false;
        error = "";
        status = "";
        image = null;
        notifyListeners();
        globalStore.imageUrl = result.url!;
        globalStore.imageName = "${result.taskId!}.png";
        globalStore.prompt = editView.prompt.text;
        globalStore.currentImageData = CurrentImageData(globalStore.imageName, editView.prompt.text, "None");
        globalStore.currentImageData?.save();
        editView.prompt.text = "";
        // router.push("/image");
        // use cupertino bottom sheet
        // ignore: use_build_context_synchronously
        if(!context.mounted) return;
        showCupertinoModalBottomSheet(
            context: context,
            duration: const Duration(milliseconds: 300),
            expand: true,
            builder: (context) => DisplayOutputView()
        );
        return;
      }
    }
  }

  update() {
    notifyListeners();
  }

  Future<ByteBuffer?> localResizeImage() async {
    int width, height;
    Uint8List? data;
    try {
            final documents = await getTemporaryDirectory();
      final targetPath = "${documents.path}/temp.png";
      print(targetPath);
      final file = await FlutterImageCompress.compressAndGetFile(image!.file.path, targetPath, quality: 90, format: CompressFormat.png);
      data = await file!.readAsBytes();

      final memoryImageSize = image_size_getter.ImageSizeGetter.getSize(image_size_getter.MemoryInput(data));
      width = memoryImageSize.width;
      height = memoryImageSize.height;
    } catch (err) {
      print(err);
      error = "Could not get image dimensions";
      notifyListeners();
      return null;
    }


    ByteData? bytes;
    const maxWidth = 1024;
    const maxHeight = 1024;

    print("width: $width");
    print("height: $height");
    if (width > maxWidth || height > maxHeight) {
      // calculate targetWidth/targetHeight to "contain"
      final aspectRatio = width / height;
      var targetWidth = maxWidth;
      int targetHeight = (targetWidth / aspectRatio).round();
      if (targetHeight > maxHeight) {
        // calculate targetHeight to "contain"
        targetHeight = maxHeight;
        targetWidth = (targetHeight * aspectRatio).round();
        print("targetHeight: $targetHeight");
        print("targetWidth: $targetWidth");
      }

      print("resizing");

      bytes = await resizeImage(data, width: targetWidth, height: targetHeight);
    } else {
      print("not resizing");
      // convert data to ByteData
      bytes = ByteData.view(data.buffer);
    }
    if (bytes == null) {
      error = "Could not resize image";
      notifyListeners();
      return null;
    }
    return bytes.buffer;
  }
}

class HideImageStore extends ChangeNotifier {
  var hideImage = false;
  update() {
    notifyListeners();
  }
}

var hideImageStore = HideImageStore();

class EditImageView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: editView,
      child: Consumer<EditImageViewStore>(
        builder: (context, notifier, child) => ListView(
          padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
          shrinkWrap: true,
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          children: [
            if (editView.image != null) ...{
              ChangeNotifierProvider.value(
                  value: hideImageStore,
                  child: Consumer<HideImageStore>(builder: (context, notifier, child) {
                    if (hideImageStore.hideImage) {
                      return const Padding(
                        padding: EdgeInsets.all(10),
                        child: Column(
                          children: [
                            // info icon
                            Icon(Icons.info_outline),
                            Text("Image hidden while typing because of space constraings")
                          ],
                        ),
                      );
                    }
                    return LimitedBox(
                      maxHeight: MediaQuery.of(context).size.height / 2,
                      child: Image(image: editView.image!, fit: BoxFit.contain),
                    );
                  })),
            },
            ListView(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
              children: [
                if (editView.generating) ...{
                  const SizedBox(height: 50),
                  const Center(child: CircularProgressIndicator()),
                  const SizedBox(height: 20),
                  Center(child: Text(editView.status)),
                  const SizedBox(height: 50),
                } else ...{
                  if (editView.image != null) ...{
                    // Image(image: editView.image!),
                    // SizedBox(height: 7),
                    TextField(
                      style: const TextStyle(fontSize: 15, height: 1.1),
                      decoration: const InputDecoration(hintText: "Enter a thorough description of the new image right here. Tap here to start typing."),
                      controller: editView.prompt,
                      enabled: true,
                      autocorrect: true,
                      maxLines: 10,
                      minLines: 1,
                      onTapOutside: (b) {
                        hideImageStore.hideImage = false;
                        editView.update();
                        tapOutsideOverlayState.hide();
                        FocusManager.instance.primaryFocus?.unfocus();
                      },
                      onTap: () => {
                        tapOutsideOverlayState.show(),
                        hideImageStore.hideImage = true,
                        editView.update(),
                      },
                    ),
                    const SizedBox(height: 8),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 0, vertical: 0),
                      child: Stack(
                        children: [
                          Center(child: Text("Similarity", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text("Different"),
                              Text("Same"),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                          trackHeight: 2.0,
                          trackShape: SliderCustomTrackShape(),
                          thumbColor: Colors.transparent,
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
                          overlayShape: SliderComponentShape.noOverlay),
                      child: ChangeNotifierProvider.value(
                        value: sliderModel,
                        child: Consumer<SliderModel>(
                          builder: (context, notifier, child) => Slider(
                            value: sliderModel.value,
                            onChanged: (value) {
                              sliderModel.update(value);
                            },
                            activeColor: Colors.purple,
                            min: 1,
                            max: 60,
                            divisions: 59,
                            label: "${sliderModel.value.round()}",
                          ),
                        ),
                      ),
                    ),
                  },
                  if (editView.image == null)
                    ElevatedButton(
                      onPressed: () {
                        editView.showImagePicker();
                      },
                      child: Text(editView.image == null ? "Pick From Photos" : "Pick Other Image"),
                    ),
                  if (editView.image != null) ...{
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.grey, foregroundColor: Colors.white),
                      onPressed: () {
                        editView.image = null;
                        editView.update();
                      },
                      child: const Text("Clear"),
                    ),
                    ElevatedButton(
                      onPressed: () => editView.startGenerating(context),
                      child: ChangeNotifierProvider.value(
                        value: editView,
                        child: Consumer<EditImageViewStore>(
                          builder: (context, notifier, child) => Text(
                            editView.prompt.text.length > editView.minChars
                                ? "Create Variant"
                                : ("${editView.minChars - editView.prompt.text.length} More Characters"),
                            style: const TextStyle(fontSize: 15),
                          ),
                        ),
                      ),
                    ),
                  },
                  const SizedBox(height: 7),
                },
                if (editView.error != "") ...{
                  const SizedBox(height: 5),
                  Text(editView.error, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 10),
                  if (editView.generating)
                    ElevatedButton(
                      onPressed: () {
                        editView.cancel = true;
                        editView.update();
                      },
                      child: const Text("Cancel"),
                    ),
                },
              ],
            ),
          ],
        ),
      ),
    );
  }
}


class SliderCustomTrackShape extends RoundedRectSliderTrackShape {
  @override
  Rect getPreferredRect({
    required RenderBox parentBox,
    Offset offset = Offset.zero,
    required SliderThemeData sliderTheme,
    bool isEnabled = false,
    bool isDiscrete = false,
  }) {
    final double? trackHeight = sliderTheme.trackHeight;
    final double trackLeft = offset.dx;
    final double trackTop = offset.dy + (parentBox.size.height - trackHeight!) / 2;
    final double trackWidth = parentBox.size.width;
    return Rect.fromLTWH(trackLeft, trackTop, trackWidth, trackHeight);
  }
}
