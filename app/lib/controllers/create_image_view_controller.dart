import 'dart:async';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:dev/views/display_all_images_view.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';

checkIfHasEnoughCredits() {
  return false;
}

class GenerateImageResponse {
  String? taskId;
  String? error;
  int? creditsRemaining;
  String? code;

  GenerateImageResponse({this.taskId, this.error, this.creditsRemaining, this.code});

  GenerateImageResponse.fromJson(Map<String, dynamic> json) {
    taskId = json['taskId'];
    error = json['error'];
    creditsRemaining = json['creditsRemaining'];
    code = json['code'];
  }
}

class ImageStatusResponse {
  String? outputUrl;
  int? creditsRemaining;
  String? code;
  String? error;
  String? status;

  ImageStatusResponse({this.outputUrl, this.creditsRemaining, this.code, this.error, this.status});

  ImageStatusResponse.fromJson(Map<String, dynamic> json) {
    outputUrl = json['outputUrl'];
    creditsRemaining = json['creditsRemaining'];
    code = json['code'];
    error = json['error'];
    status = json['status'];
  }
}

class StatusResult {
  String? error;
  String? code;
  String status;
  String? url;
  String? taskId;
  String? model;
  dynamic data;

  StatusResult({this.error, this.code, required this.status, this.url, this.taskId, this.model, this.data});
}
Future<StatusResult> pollStatus(String taskId) async {
  var result = await getRequest("/api/poll-image-status?taskId=$taskId");
  // if has key result.result[status] 
  var status = "";
  if(result.result.containsKey('status')) {
    status = result.result['status'];
  }
  if (result.error != null) {
    print("error si");
    print(result.error);
    return StatusResult(error: result.error, status: status, taskId: taskId, model: result.result['model']);
  }
  print("reesult is");
  print(result.result);
  if (result.result['outputUrl'] == null || result.result['outputUrl'] == "") {
    return StatusResult(status: result.result['status'], taskId: taskId, model: result.result['model']);
  } else {
    globalAuthenticatedUser.creditsRemaining = double.tryParse((result.result['creditsRemaining'] ?? 0).toString()) ?? 0;
    globalStore.saveUserData();
    return StatusResult(url: result.result['outputUrl'], taskId: taskId, status: "", model: result.result['model']);
  }
}

Future<StatusResult> createImageButtonPressed(String prompt, String style, String model, int? promptId, Function onStatusUpdate) async {
  var body = {
    'prompt': prompt,
    'style': style,
    'model': model,
    'promptId': promptId,
    'newAndroid': true
  };
  onStatusUpdate("Submitting Prompt");
  var response = await postRequest("/api/submit-image-generate-with-prompt", body);

  if (response.result['code'] == "insufficient_credits") {
    globalAuthenticatedUser.creditsRemaining = double.tryParse((response.result['creditsRemaining'] ?? 0).toString()) ?? 0;
    globalStore.saveUserData();
    return StatusResult(error: "Insufficient Credits", code: "insufficient_credits", status: "", data: response.result);
  } else if (response.result['code'] == 'nsfw') {
    return StatusResult(error: "NSFW content detected", code: "nsfw", status: "", data: response.result);
  } else if (response.error != null && response.error != "") {
    // if response.result exists and is a map, get code
    final code = response.result['code'] ?? "";
    return StatusResult(error: response.error, status: "", code: code, data: response.result);
  } else if (response.result['taskId'] != null && response.result['taskId'] != "") {
    for (int i = 0; i < 60; i++) {
      await Future.delayed(const Duration(seconds: 2));
      final result = await pollStatus(response.result['taskId']!);
      onStatusUpdate(result.status);
      if (result.url != null) {
        return result;
      }
      if(result.error != null && result.error != "") {
        onStatusUpdate(result.status != "" ? result.status : result.error ?? "");
        return StatusResult(error: result.error, status: "");
      }
      onStatusUpdate(result.status != "" ? result.status : "Generating Image");
    }
    return StatusResult(error: "Timeout", status: "");
  } else {
    return StatusResult(error: "Unknown error", status: "");
  }
}
