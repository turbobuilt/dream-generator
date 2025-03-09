import 'dart:convert';

import 'package:dev/lib/native_messaging.dart';
import 'package:dev/lib/server_event_bus.dart';
import 'package:dev/views/in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/network_helper.dart';
import '../../main.dart';
import '../../models/AuthenticatedUser.dart';
import '../../models/CurrentImageData.dart';

class GlobalStore {
  String userToken = "";
  String imageUrl = "";
  String imageName = "";
  String localImageUrl = "";
  bool showSexualContent = false;
  String prompt = "";
  String? selectedPlan = InAppPurchaseViewState.productIds.first; // "ai.dreamgenerator.app.biggest_plan";
  CurrentImageData? currentImageData;

  Future<CurrentImageData?> setImage(String url) async {
    imageUrl = url;
    final fileName = imageUrl.split('/').last;
    globalStore.currentImageData = await CurrentImageData.load(fileName);
    return globalStore.currentImageData;
  }

  Future<void> saveUserData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    var mapData = jsonEncode(globalAuthenticatedUser.toMap());
    prefs.setString("authenticatedUser", mapData);
    prefs.setString("userToken", globalStore.userToken);
    loadAuthenticatedUser();
  }

  Future<void> saveUserDataToServer() async {
    try {
      final response = await postRequest("/api/user/me", {
        "trialDeclined": globalAuthenticatedUser.trialDeclined,
        "understandsPublishCommitment": globalAuthenticatedUser.understandsPublishCommitment,
      });
      if (response.error != null) {
        return;
      }
    } catch (e) {
      print("Error saving user data");
      print(e);
    }
  }

  Future<void> fetchAuthenticatedUser() async {
    try {
      final response = await getRequest("/api/user");
      if (response.error != null) {
        return;
      }
      setUserData(response.result, null);
    } catch (e, stacktrace) {
      print("Error fetching authenticated user");
      print(e);
      // print stack trace
      print(stacktrace);
    }
  }

  Future<void> loadAuthenticatedUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    userToken = prefs.getString("userToken") ?? "";
    var mapData = prefs.getString("authenticatedUser");
    if (mapData != null) {
      globalAuthenticatedUser.applyMapValues(jsonDecode(mapData));
    } else {
      // this code is left for legacy reasons
      globalAuthenticatedUser.id = prefs.getInt("id");
      globalAuthenticatedUser.name = prefs.getString("name") ?? "";
      globalAuthenticatedUser.email = prefs.getString("email") ?? "";
      globalAuthenticatedUser.creditsRemaining = parseDouble(prefs.get("creditsRemaining")) ?? 0;
      globalAuthenticatedUser.agreesToTerms = prefs.getBool("agreesToTerms") ?? false;
      globalAuthenticatedUser.understandsPublishCommitment = prefs.getBool("understandsPublishCommitment") ?? false;
      globalAuthenticatedUser.autoPublish = prefs.getInt("autoPublish") ?? 0;
      globalAuthenticatedUser.userName = prefs.getString("userName") ?? "";
      globalAuthenticatedUser.plan = prefs.getString("plan") ?? "";
      globalAuthenticatedUser.trialUsed = prefs.getBool("trialUsed") ?? false;
      globalAuthenticatedUser.isOnTrial = prefs.getBool("isOnTrial") ?? false;
      globalAuthenticatedUser.trialDeclined = prefs.getBool("trialDeclined") ?? false;
      globalAuthenticatedUser.callKitPushToken = prefs.getString("callKitPushToken") ?? "";
    }
  }

  // you would need the Dio/HTTP package for this
  Future<String?> userAgreesToTerms() async {
    final result = await getRequest("/api/user-agrees");
    if (result.error != null) {
      return result.error;
    }
    globalAuthenticatedUser.creditsRemaining = double.tryParse((result.result["creditsRemaining"] ?? 0).toString()) ?? 0;
    globalAuthenticatedUser.agreesToTerms = true;
    saveUserData();
    return null;
  }
}

parseBool(dynamic value) {
  if (value == null) return false;
  // if it is a bool type, return it
  if (value is bool) return value;
  // if it is a string, convert it to lower case and check if it is equal to "true"
  if (value is String) return value.toLowerCase() == "true";
  // if its an int type, check if it is equal to 1
  if (value is int) return value == 1;
  // if it's a double type, check if it is equal to 1.0
  if (value is double) return value == 1.0;
  // if it's a number type, check if it is equal to 1
  if (value is num) return value == 1;
  return false;
}

parseDouble(dynamic value) {
  if (value == null) return 0.0;
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0.0;
  return 0.0;
}

Future<ActionResult> setUserData(Map userData, token) async {
  globalAuthenticatedUser.applyMapValues(userData);
  if (token != null) {
    globalStore.userToken = token;
  }
  SharedPreferences prefs = await SharedPreferences.getInstance();
  globalStore.saveUserData();
  // sseNotifications.ensureConnected(globalStore.userToken);
  // messageChannel.invokeMethod('setUserData', userData);
  print("will invoke setUserToken ${globalStore.userToken}");
  MessageChannel.channel.invokeMethod('setUserToken', globalStore.userToken);
  return ActionResult(userData, null);
}
