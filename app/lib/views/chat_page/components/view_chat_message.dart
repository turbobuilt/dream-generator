
import 'dart:math';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ViewChatMessage extends StatefulWidget {
  final Map chatMessage;
  const ViewChatMessage(this.chatMessage);

  @override
  ViewChatMessageState createState() => ViewChatMessageState();

}

class ViewChatMessageState extends BetterState<ViewChatMessage> {
  String? error;
  List? items = [];
  var loading = true;


  @override
  void initState() {
    super.initState();
    getChatMessage();
  }

  getChatMessage() async {
    var result = await callMethod("postFetchChatMessageContent", [widget.chatMessage["id"]]);
    loading = false;
    update();
    if(result["code"] == "not_found") {
      showAlert("Chat message not found, probably read already");
      chatPageState.chatMessages.removeWhere((element) => element["chatMessage"]["id"] == widget.chatMessage["id"]);
      router.pop();
      return;
    }
    if (await showHttpErrorIfExistsAsync(result)) {
      router.pop();
      return;
    }
    items = result["items"];
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Flexible(
              child: ListView(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                children: [
                  if (loading)
                    const Center(child: CircularProgressIndicator())
                  else if (error != null)
                    Text(error!)
                  else
                    for (var item in items!)
                      Text(item["text"])
                ],
              ),
            ),
            CupertinoDialogAction(
              child: const Text("Close"),
              onPressed: () {
                router.pop(true);
              },
            ),
          ],
        ),
      ),
    );
  }
}