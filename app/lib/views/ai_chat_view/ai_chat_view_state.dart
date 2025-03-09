import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:flutter/material.dart';

class AiChatViewState extends BetterChangeNotifier {
  List<Map<dynamic, dynamic>> currentChat = [];
  // var inputKey = GlobalKey();
  var inputFocusNode = FocusNode();
  var error = "";
  
  loadModels() async {
    // AiChatModel
    var result = await callMethod("getChatModels", []);
  }
}

var aiChatViewGlobalState = AiChatViewState();