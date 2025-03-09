import 'dart:io';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:flutter_callkit_incoming/flutter_callkit_incoming.dart';

requestPushToken() async {
  if (Platform.isIOS) {
    var pushKitToken = await FlutterCallkitIncoming.getDevicePushTokenVoIP();
    if (pushKitToken?.isNotEmpty == true) {
      await postRequest("/api/post-set-call-kit-push-token", {
        "pushToken": pushKitToken,
      });
    }
  }
}
