import 'dart:io';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/main.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:dev/views/video_view/video_call.dart';
import 'package:dev/views/video_view/video_call_state.dart';
import 'package:flutter/material.dart';

class StartVideoCall extends StatefulWidget {
  Map profile;

  StartVideoCall(this.profile);

  @override
  StartVideoCallState createState() => StartVideoCallState();
}

class StartVideoCallState extends BetterState<StartVideoCall> {
  bool? isVideoChatAvailable = false;

  @override
  void initState() {
    super.initState();
    postCheckIfUserIsAvailableForVideo();
  }

  void postCheckIfUserIsAvailableForVideo() async {
    var response = await callMethod("postCheckIfUserIsAvailableForVideo", [
      {"userId": widget.profile["userId"]}
    ]);
    if (response["available"]) {
      isVideoChatAvailable = true;
    } else {
      isVideoChatAvailable = false;
    }
    update();
  }

  @override
  Widget build(BuildContext context) {
    if (isVideoChatAvailable == null || isVideoChatAvailable == false) {
      return Container();
    }
    return ElevatedButton(
      onPressed: () async {
        // await FlutterCallkitIncoming.requestNotificationPermission({
        //   "rationaleMessagePermission": "Notification permission is required, to show notification.",
        //   "postNotificationMessageRequired": "Notification permission is required, Please allow notification permission from setting."
        // });
        // if (Platform.isIOS && globalAuthenticatedUser.callKitPushToken.isEmpty == true) {
        //   var token = await FlutterCallkitIncoming.getDevicePushTokenVoIP();
        //   if (token?.isNotEmpty == true) {
        //     await postRequest("/api/post-set-call-kit-push-token", {
        //       "pushToken": token,
        //     });
        //   }
        // }
        videoCallState.startCall([widget.profile["userId"]]);
      },
      child: const Text('Video Call'),
    );
  }
}