import 'package:dev/helpers/router.dart';
import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:flutter/material.dart';

class TemporaryChatPopup extends StatefulWidget {
  @override
  TemporaryChatPopupState createState() => TemporaryChatPopupState();
}

class TemporaryChatPopupState extends State<TemporaryChatPopup> {
  var saving = false;
  
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text("Chats are temporary"),
      content: const Text("You can only see 'em once!"),
      actions: <Widget>[
        TextButton(
          onPressed: () async {
            var result = await callMethod("postUpdateTemporaryChatPopupShown", []);
            if (showHttpErrorIfExists(result)) {

            }
            router.pop();
          },
          // loading spinner or close
          child: saving ? const CircularProgressIndicator() : const Text("OK"),
        ),
      ],
    );
  }
}