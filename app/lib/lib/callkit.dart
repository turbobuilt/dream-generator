import 'dart:io';

import 'package:dev/helpers/router.dart';
import 'package:dev/lib/server_event_bus.dart';
import 'package:dev/views/video_view/video_call_state.dart';
import 'package:flutter_callkit_incoming/entities/call_event.dart';
import 'package:flutter_callkit_incoming/flutter_callkit_incoming.dart';

handleVoipPushIfNeeded() async {
  // if (Platform.isIOS)
  //   return;
  var currentCall = await getCurrentCall();
  print("handling voip push $currentCall");
  if (currentCall != null) {
    if (currentCall["extra"] == null) {
      print("NO EXTRA DATA");
      return;
    }
    videoCallState.receiveCall(currentCall["extra"]);
  }
}

Future<dynamic> getCurrentCall() async {
  //check current call from pushkit if possible
  var calls = await FlutterCallkitIncoming.activeCalls();
  if (calls is List) {
    if (calls.isNotEmpty) {
      print('DATA: $calls');
      // _currentUuid = calls[0]['id'];
      return calls[0];
    } else {
      // _currentUuid = "";
      return null;
    }
  }
}

Future<void> startListeningForFlutterCallkit() async {
  try {
    print("startListeningForFlutterCallkit ");
    FlutterCallkitIncoming.onEvent.listen((event) async {
      print('GOT EVENT HOME: $event');
      print("event type ${event?.event}");
      switch (event!.event) {
        case Event.actionCallIncoming:
          // print("got incoming call");
          // TODO: received an incoming call
          break;
        case Event.actionCallStart:
          // TODO: started an outgoing call
          // TODO: show screen calling in Flutter
          break;
        case Event.actionCallAccept:
          // TODO: accepted an incoming call
          // TODO: show screen calling in Flutter
          // NavigationService.instance.pushNamedIfNotCurrent(AppRoute.callingPage, args: event.body);
          
          await sseNotifications.connect();
          videoCallState.receiveCall(event.body["extra"], callkitId: event.body["id"]);
          break;
        case Event.actionCallDecline:
          // TODO: declined an incoming call
          // await requestHttp("ACTION_CALL_DECLINE_FROM_DART");
          break;
        case Event.actionCallEnded:
          videoCallState.closeVideoCall(callkitId: event.body["id"]);
          // TODO: ended an incoming/outgoing call
          break;
        case Event.actionCallTimeout:
          videoCallState.closeVideoCall(callkitId: event.body["id"]);
          // TODO: missed an incoming call
          break;
        case Event.actionCallCallback:
          // TODO: only Android - click action `Call back` from missed call notification
          break;
        case Event.actionCallToggleHold:
          // TODO: only iOS
          break;
        case Event.actionCallToggleMute:
          // TODO: only iOS
          break;
        case Event.actionCallToggleDmtf:
          // TODO: only iOS
          break;
        case Event.actionCallToggleGroup:
          // TODO: only iOS
          break;
        case Event.actionCallToggleAudioSession:
          // TODO: only iOS
          break;
        case Event.actionDidUpdateDevicePushTokenVoip:
          // TODO: only iOS
          break;
        case Event.actionCallCustom:
          break;
      }
    });
  } on Exception catch (e) {
    print("ERROR LISTENING FOR CALLS $e");
  }
}
