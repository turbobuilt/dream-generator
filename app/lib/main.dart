import 'dart:io';
import 'package:dev/helpers/iap_helper/iap_helper.dart';
import 'package:dev/helpers/push_notification_popup.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/lib/ads.dart';
import 'package:dev/lib/callkit.dart';
import 'package:dev/lib/server_event_bus.dart';
import 'package:dev/lib/setup_deep_links.dart';
import 'package:dev/models/AuthenticatedUser.dart';
import 'package:dev/views/app/app.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:dev/views/display_all_images_view.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/notifications_view/notifications_state.dart';
import 'package:dev/views/video_view/components/incoming_call.dart';
import 'package:dev/views/video_view/components/request_voip_token.dart';
import 'package:facebook_app_events/facebook_app_events.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import 'lib/init_firbase.dart';
import 'lib/init_firebase_messaging.dart';
import 'main.reflectable.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'models/CurrentImageData.dart';
import 'package:app_tracking_transparency/app_tracking_transparency.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'views/in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';

FirebaseAnalytics analytics = FirebaseAnalytics.instance;
var purchaseViewData = InAppPurchaseViewState();
final dio = Dio();
final globalDisplayAllImagesViewStore = DisplayAllImagesViewStore();

// var apiOrigin = kReleaseMode ? "https://api.dreamgenerator.ai" : "http://10.0.0.90:5005";
var apiOrigin = "https://api.dreamgenerator.ai";
var website = "https://dreamgenerator.ai";

GlobalStore globalStore = GlobalStore();
GoogleSignIn googleSignIn = GoogleSignIn();
AuthenticatedUser globalAuthenticatedUser = AuthenticatedUser();

var facebookAppEvent = FacebookAppEvents();
final iapHandler = IAPHandler();

BuildContext? buildContext;
Uri? deepLink;
dynamic routeData;

// Entry point for the app
void main() async {
  var start = DateTime.now();
  WidgetsFlutterBinding.ensureInitialized();
  print("widgets binding time: ${DateTime.now().difference(start).inMilliseconds}");
  start = DateTime.now();
  initializeReflectable();
  print("reflectable time: ${DateTime.now().difference(start).inMilliseconds}");
  start = DateTime.now();
  initFirebase().then((value) {
    initFirebaseMessaging(buildContext);
  });
  
  start = DateTime.now();
  MobileAds.instance.initialize();
  print("mobile ads time: ${DateTime.now().difference(start).inMilliseconds}");
  start = DateTime.now();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
  runApp(const App());
  await globalStore.loadAuthenticatedUser();
  sseNotifications.connect().then((_) async {
    startListeningForFlutterCallkit();
    handleVoipPushIfNeeded();
  }).catchError((err) {
    startListeningForFlutterCallkit();
    print(err);
  });
  print("run app time: ${DateTime.now().difference(start).inMilliseconds}");

  purchaseViewData.getIapObjects();
  var loadImagesPromise = globalDisplayAllImagesViewStore.loadImagePaths();
  loadImagesPromise.then((value) {
    mainViewState.update();
  }).catchError((err) {
    print("Error loading images");
    print(err);
  });
  convertPromptFiles();
  PushNotificationPopup.showPushNotificationPopup();


  AdManager.initAds();
  globalStore.fetchAuthenticatedUser().then((value) {
    print("fetched user");
    print(globalAuthenticatedUser);
    
    mainViewState.update();
    notificationsState.getNotifications();
  }).catchError((err) {
    print("Error fetching user");
    print(err);
  });

  if (globalAuthenticatedUser.id != null && globalAuthenticatedUser.id! > 0) {
    print("global authenticated user exists, so going to home");
    print(globalAuthenticatedUser);
    router.replace("/home");
  } else {
    // router.go("/start-register-modal");
    router.replace("/login");
  }
  setupDeepLinks();
  if (await AppTrackingTransparency.trackingAuthorizationStatus == TrackingStatus.notDetermined) {
    await Future.delayed(const Duration(milliseconds: 200));
    await AppTrackingTransparency.requestTrackingAuthorization();
  }
  var appEvents = FacebookAppEvents();
  appEvents.setAdvertiserTracking(enabled: true);
  appEvents.flush();
  requestPushToken();
}

handleDeepLink(Uri uri) {
  if (uri.pathSegments.length == 3 && uri.pathSegments[0] == "share" && uri.pathSegments[1] == "prompt") {
    deepLink = null;
    router.push("/prompt/${uri.pathSegments[2]}");
  }
}

convertPromptFiles() async {
  try {
    final documents = await getApplicationDocumentsDirectory();
    final promptDir = Directory("${documents.path}/prompts");
    final promptFiles = promptDir.listSync();
    for (var promptFile in promptFiles) {
      if (!promptFile.path.endsWith(".txt")) {
        continue;
      }
      final name = promptFile.path.split("/").last.split(".").first;
      final imageName = "$name.png";
      final file = File(promptFile.path);
      final prompt = await file.readAsString();
      final imageData = CurrentImageData(imageName, prompt, "None");
      imageData.save();
    }
  } catch (err) {
    print(err);
  }
}

parseBool(dynamic input) {
  if (input == null) {
    return false;
  }
  if (input is bool) {
    return input;
  }
  if (input is int) {
    return input == 1;
  }
}
