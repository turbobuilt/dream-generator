import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../main.dart';
import 'network_helper.dart';

class PushNotificationPopup {
  static void submitPushNotificationToken(String? token) async {
    // final token = await FirebaseMessaging.instance.getToken();
    print("token");
    print(token);
    if (token != null) {
      print("saving push notification token");
      final result = await postRequest("/api/user/me", {"pushToken": token});
      if (result.error != null) {
        print("error saving push notification token");
        print(result.error);
        return;
      }
      print("saved push notification token");
    }
  }

  static void showPushNotificationPopup() async {
    // first check if prompted
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final prompted = prefs.getBool("pushNotificationPrompted") ?? false;
    if (prompted) {
      return;
    }
    prefs.setBool("pushNotificationPrompted", true);
    print("prompting for push");

    FirebaseMessaging messaging = FirebaseMessaging.instance;

    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    print('User granted permission: ${settings.authorizationStatus}');
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // save token to shared preferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      prefs.setString("pushNotificationToken", await FirebaseMessaging.instance.getToken() ?? "");
      print("authorized");
    }
    globalStore.saveUserDataToServer();
  }
}