import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:dev/views/notifications_view/notifications_state.dart';
import 'package:dev/views/video_view/video_call_state.dart';
import 'package:flutter/services.dart';

class MessageChannel {
  static const MethodChannel channel = MethodChannel('com.dreamgenerator.ai/messages');

  static Future<void> setUserToken(String token) async {
    try {
      await channel.invokeMethod('setUserToken', token);
    } on PlatformException catch (e) {
      print("Failed to set user token: '${e.message}'.");
    }
  }

  static void listenToMessages() {
    print("Beginingin to listen to messages\n");
    channel.setMethodCallHandler((MethodCall call) async {
      switch (call.method) {
        case 'someMethod': // Replace with actual method names you expect "notification", "videoChatCallRequest", "endVideoChat", "videoChatSdpOffer", "videoChatCallAnswer", "videoChatSdpAnswer", "iceCandidate", "videoChatReject", "chatMessage"
        case "notification":
          notificationsState.notificationReceived(call.arguments["data"]["notification"]);
          break;
        case "videoChatCallRequest":
          videoCallState.videoChatCallRequest(call.arguments);
          break;
        case "endVideoChat":
          videoCallState.endVideoChatReceived(call.arguments);
          break;
        case "videoChatSdpOffer":
          videoCallState.videoChatSdpOffer(call.arguments);
          break;
        case "videoChatCallAnswer":
          videoCallState.videoChatCallAnswer(call.arguments);
          break;
        case "videoChatSdpAnswer":
          videoCallState.videoChatSdpAnswer(call.arguments);
          break;
        case "iceCandidate":
          videoCallState.iceCandidate(call.arguments);
          break;
        case "videoChatReject":
          videoCallState.videoChatReject(call.arguments);
          break;
        case "chatMessage":
          chatPageState.chatMessageReceived(call.arguments);
          break;
        
        default:
          print('Unrecognized method: ${call.method}');
      }
    });
  }
}