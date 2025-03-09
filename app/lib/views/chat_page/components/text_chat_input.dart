import 'package:flutter/material.dart';

class TextChatInput extends StatefulWidget {
  Future<bool> Function(String) sendMessage;

  TextChatInput({required this.sendMessage});

  @override
  TextChatInputState createState() => TextChatInputState();
}

class TextChatInputState extends State<TextChatInput> {
  var controller = TextEditingController();

  submit() async {
    var message = controller.text;
    if (message.isNotEmpty) {
      if (await widget.sendMessage(message)) {
        controller.clear();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: TextField(
                autofocus: true,
                controller: controller,
                onSubmitted: (value) => submit(),
                textInputAction: TextInputAction.send,
                decoration: const InputDecoration(hintText: "Type a message", contentPadding: EdgeInsets.all(0)),
              ),
            ),
            IconButton(
              padding: const EdgeInsets.all(0),
              onPressed: () => submit(),
              icon: const Icon(Icons.send),
            )
          ],
        ),
      ),
    );
  }
}
