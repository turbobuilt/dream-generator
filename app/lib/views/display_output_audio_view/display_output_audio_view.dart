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
import 'package:dev/views/display_output_audio_view/components/audio_display.dart';
import 'package:dev/views/display_output_audio_view/components/delete_audio_button.dart';
import 'package:dev/views/display_output_audio_view/components/downloading_audio.dart';
import 'package:dev/views/display_output_audio_view/components/publish_audio_button/publish_audio_button.dart';
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
import 'package:dev/views/generate_audio/generate_audio_state.dart';
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

class DisplayOutputAudioView extends StatefulWidget {
  GenerateAudioRequest generateAudioRequest;

  DisplayOutputAudioView(this.generateAudioRequest);

  @override
  DisplayOutputAudioViewState createState() => DisplayOutputAudioViewState();
}

class DisplayOutputAudioViewState extends BetterState<DisplayOutputAudioView> {
  var error = "";
  var liking = false;
  double downloadProgress = 0;
  var downloading = false;

  @override
  void initState() {
    super.initState();
    handleAudio(widget.generateAudioRequest);
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
      await generateAudioRequest.save();
      generateAudioState.audioFiles.insert(0, generateAudioRequest);
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

  double iconSize = 30;
  ButtonStyle buttonStyle = ButtonStyle(
    padding: WidgetStateProperty.all(const EdgeInsets.all(4.0)),
    backgroundColor: WidgetStateProperty.all(primaryBackground.withOpacity(.6)),
    foregroundColor: WidgetStateProperty.all(Colors.white),
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
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.generateAudioRequest.downloaded)
          AudioDisplay(generateAudioRequest: widget.generateAudioRequest, autoPlay: true)
        else ...{
          DownloadingAudio(this),
          const SizedBox(height: 30),
        },
        if (error != "")
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [Text("Error: $error", style: const TextStyle(fontSize: 18.0))],
            ),
          ),
        Container(
          padding: const EdgeInsets.all(10.0),
          child: ListView(
            padding: EdgeInsets.zero,
            shrinkWrap: true,
            children: [
              if (widget.generateAudioRequest.downloaded)
                GridView.count(
                  crossAxisCount: min(3, (MediaQuery.of(context).size.width / 85) < 6 ? 5 : 6),
                  shrinkWrap: true,
                  padding: EdgeInsets.zero,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  children: [
                    // PublishImageButton(parentWidget: widget, parentWidgetState: this),
                    // ShareButton(this),
                    // SaveToPhotosButton(imageLoader, buttonStyle, iconSize),
                    // RedoButton(this),
                    // ModifyButton(modifyImage, buttonStyle, iconSize),
                    PublishAudioButton(parentAudioWidgetState: this),
                    DeleteAudioButton(this)
                  ],
                ),
            ],
          ),
        ),
          
        // const Spacer(),
        CloseViewButton(),
        const SizedBox(height: 5),
        // safeare
        const SafeArea(bottom: true, child: SizedBox(height: 0)),
      ],
    );
  }
}
