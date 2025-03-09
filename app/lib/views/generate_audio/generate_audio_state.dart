import 'package:dev/helpers/datastore.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/lib/ads.dart';
import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/models/GenerateAudioRequest.dart';
import 'package:dev/views/display_output_audio_view/display_output_audio_view.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:path_provider/path_provider.dart';

// export class GenerateAudioRequest extends DbObject {
//     prompt: string;
//     model: string;
//     status?: string;
//     duration?: number;
//     error?: string;
//     outputUrl?: string;
// }

class GenerateAudioState extends BetterChangeNotifier {
  String error = "";
  var promptTextController = TextEditingController(text: "");
  dynamic result; // GenerateAudioRequest
  double downloadProgress = 0;
  var downloading = false;
  List<GenerateAudioRequest> audioFiles = [];
  var generatingAudio = false;

  GenerateAudioState() {
    getAudioFiles();
  }

  getAudioFiles() async {
    var box = await getBox<Map>("generateAudioRequest");
    var items = (await box.getAllValues()).values.toList();
    items.sort((a, b) => a["id"].compareTo(b["id"]));
    audioFiles = items.map((item) => GenerateAudioRequest.fromJson(item)).toList();
    print("audioFiles: $audioFiles");
    notifyListeners();
  }

  generateAudio() async {
    error = "";
    downloadProgress = 0;
    notifyListeners();
    AdManager.showInterstitialAdIfAppropriate();

    // generate audio
    generatingAudio = true;
    notifyListeners();
    result = await callMethod("postGenerateAudio", [
      {
        "prompt": promptTextController.text,
        "duration": 30
      }
    ]);
    generatingAudio = false;
    if (showHttpErrorIfExists(result)) {
      result = null;
      notifyListeners();
      return;
    }
    if (result["outputUrl"] == null) {
      showAlert("Error - No audio to download");
      notifyListeners();
      return;
    }

    var generateAudioRequest = GenerateAudioRequest.fromJson(result);

    await showCupertinoModalBottomSheet(
      context: navigatorKey.currentContext!,
      duration: const Duration(milliseconds: 300),
      expand: false,
      builder: (context) => DisplayOutputAudioView(generateAudioRequest),
    );
    notifyListeners();
  }

  showAudio(GenerateAudioRequest item) {
    showModalBottomSheet(
      context: navigatorKey.currentContext!,
      isDismissible: true,
      builder: (context) => DisplayOutputAudioView(item),
    );
  }
}

var generateAudioState = GenerateAudioState();
