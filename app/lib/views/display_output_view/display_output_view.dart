// ignore_for_file: equal_elements_in_set

import 'dart:io';
import 'dart:math';
import 'dart:ui';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/images.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/models/GenerateAudioRequest.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/display_all_images_view.dart';
import 'package:dev/views/display_output_view/components/close_view_button.dart';
import 'package:dev/views/display_output_view/components/delete_button.dart';
import 'package:dev/views/display_output_view/components/downloading_image.dart';
import 'package:dev/views/display_output_view/components/image_backdrop.dart';
import 'package:dev/views/display_output_view/components/modify_button.dart';
import 'package:dev/views/display_output_view/components/publish_image_button.dart';
import 'package:dev/views/display_output_view/components/redo_button.dart';
import 'package:dev/views/display_output_view/components/save_to_photos_button.dart';
import 'package:dev/views/display_output_view/components/share_button.dart';
import 'package:dev/views/display_output_view/components/zoomable_image_display.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/modify_image_view.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/publish_prompt_view/components/publish_prompt_view_state.dart';
import 'package:dev/views/publish_prompt_view/publish_prompt_view.dart';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
// import 'package:flutter_nude_detector/flutter_nude_detector.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:widget_zoom/widget_zoom.dart';
import 'package:flutter/services.dart';

import '../../helpers/request_rating.dart';
import '../../models/CurrentImageData.dart';
import '../../vars.dart';
import '../create_share_view.dart';
import '../main_view/components/main_tab_bar.dart';
import 'components/image_loader.dart';

class DisplayOutputView extends StatefulWidget {
  GenerateAudioRequest? generateAudioRequest;

  DisplayOutputView({this.generateAudioRequest});

  @override
  DisplayOutputViewState createState() => DisplayOutputViewState();
}

class DisplayOutputViewState extends BetterState<DisplayOutputView> {
  late ImageLoader imageLoader;
  var error = "";
  var liking = false;
  double downloadProgress = 0;
  var downloading = false;

  @override
  void initState() {
    super.initState();

    if (widget.generateAudioRequest != null) {
      imageLoader = ImageLoader();
      handleAudio(widget.generateAudioRequest!);
      return;
    }

    imageLoader = ImageLoader();
    imageLoader.getImage(globalStore.imageUrl, this).then((value) async {
      update(() {});
      // run anonymous function
      tryRating();
    });
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: [
      SystemUiOverlay.bottom,
    ]);
  }

  handleAudio(GenerateAudioRequest generateAudioRequest) async {
    if (await generateAudioRequest.checkIfDownloaded()) {
      update();
    } else {
      await downloadAudio(generateAudioRequest);
    }
  }

  downloadAudio(GenerateAudioRequest generateAudioRequest) async {
    try {
      downloading = true;
      downloadProgress = 0;
      update();
      var dio = Dio();
      var path = await generateAudioRequest.getLocalPath();
      var lastProgress = DateTime.now();
      await dio.download(generateAudioRequest.outputUrl, path, onReceiveProgress: (received, total) {
        if (DateTime.now().difference(lastProgress).inMilliseconds < 1000) {
          return;
        }
        lastProgress = DateTime.now();
        downloadProgress = received / total;
        update();
      });
      generateAudioRequest.downloaded = true;
      update();
    } catch (e) {
      print("error downloading audio $e");
      if (context.mounted) {
        // ignore: use_build_context_synchronously
        showAlert("error", context: context, message: "Error downloading audio $e");
      }
    } finally {
      downloading = false;
      update();
    }
  }

  safeUpdate() {
    if (mounted) {
      update(() {});
    }
  }

  tryRating() async {
    // wait 10 seconds
    // await Future.delayed(const Duration(seconds: 10));
    if (mounted) {
      // await tryShowRequestRatingModal();
    }
  }

  // before destroy show the bottom bar
  @override
  void dispose() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: [
      SystemUiOverlay.bottom,
      SystemUiOverlay.top,
    ]);
    super.dispose();
  }

  updateAutoPublish(int autoPublish) async {
    final body = {"autoPublish": autoPublish};
    globalAuthenticatedUser.autoPublish = autoPublish;
    globalStore.saveUserData();
    final result = await postRequest("/api/user/me", body);
    if (result.error != null) {
      print("error updating auto publish");
      print(result.error);
      return;
    }
  }

  showShare() {
    if (globalAuthenticatedUser.autoPublish == 1 && globalStore.currentImageData?.mostRecentShare == null) {
      print("will show publish");
      // startPublishPrompt(onComplete: showSharePage);
    } else {
      showSharePage();
    }
  }

  showSharePage() {
    print("showing share page");
    return showCupertinoModalBottomSheet(context: context, builder: (context) => CreateShareView(currentImageData: globalStore.currentImageData));
  }

  double iconSize = 30;
  ButtonStyle buttonStyle = ButtonStyle(
    padding: MaterialStateProperty.all(const EdgeInsets.all(4.0)),
    backgroundColor: MaterialStateProperty.all(primaryBackground.withOpacity(.6)),
    foregroundColor: MaterialStateProperty.all(Colors.white),
  );

  safeSetState(void Function() fn) {
    if (mounted) {
      update(fn);
    } else {
      fn();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: SizedBox(
        height: MediaQuery.of(context).size.height,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (imageLoader.localImageUrl != null) ImageBackdrop(this),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (imageLoader.localImageUrl != null)
                  ZoomableImageDisplay(this)
                else ...{
                  DownloadingImage(this),
                  const SizedBox(height: 30),
                },
                Center(
                  child: imageLoader.error != "" && imageLoader.error != null
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [Text("Error: ${imageLoader.error}", style: const TextStyle(fontSize: 18.0))])
                      : const SizedBox.shrink(),
                ),
                Container(
                  padding: const EdgeInsets.all(10.0),
                  child: ListView(
                    padding: EdgeInsets.zero,
                    shrinkWrap: true,
                    children: [
                      if (imageLoader.image != null)
                        if (imageLoader.saveMessage != null)
                          Container(
                            decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(8.0)),
                            padding: const EdgeInsets.all(8.0),
                            child: Text(imageLoader.saveMessage!, style: const TextStyle(color: Colors.white, fontSize: 18.0)),
                          ),
                      if (imageLoader.error != null)
                        Container(
                          decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(8.0)),
                          padding: const EdgeInsets.all(8.0),
                          child: Text(imageLoader.error!, style: const TextStyle(color: Colors.white, fontSize: 24.0)),
                        ),
                      if (imageLoader.localImageUrl != null)
                        GridView.count(
                          crossAxisCount: min(6, (MediaQuery.of(context).size.width / 85) < 6 ? 3 : 6),
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          children: [
                            PublishImageButton(parentImageWidget: widget, parentImageWidgetState: this),
                            ShareButton(this),
                            SaveToPhotosButton(imageLoader, buttonStyle, iconSize),
                            RedoButton(this),
                            ModifyButton(this),
                            DeleteButton(this)
                          ],
                        ),
                    ],
                  ),
                ),

                const Spacer(),
                CloseViewButton(),
                const SizedBox(height: 5),
                // safeare
                const SafeArea(bottom: true, child: SizedBox(height: 0)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
