import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

import '../helpers/router.dart';

initFirebaseMessaging(BuildContext? buildContext) {
  Future.delayed(const Duration(seconds: 1)).then((value) async {
    try {
      String? token = await FirebaseMessaging.instance.getToken();
      FirebaseMessaging.instance.getToken().then((value) {
        print("FirebaseMessaging token: $value");
      }).catchError((err) {
        print("FirebaseMessaging token error: $err");
      });
    } catch (err) {
      print("FirebaseMessaging token error: $err");
    }
  });
  FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
    print("onMessage");
    print(message.notification?.title);
    print(message.notification?.body);
    if (buildContext != null) {
      // show alert
      showDialog(
        context: router.configuration.navigatorKey.currentContext!,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(message.notification?.title ?? ""),
            content: Text(message.notification?.body ?? ""),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: const Text("OK"),
              ),
            ],
          );
        },
      );
    }
  });
}
