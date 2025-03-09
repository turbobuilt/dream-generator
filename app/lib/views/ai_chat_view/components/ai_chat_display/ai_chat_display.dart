import 'package:dev/views/ai_chat_view/ai_chat_view_state.dart';
import 'package:dev/views/ai_chat_view/components/ai_chat_display/components/chat_message.dart';
import 'package:flutter/material.dart';

class AiChatDisplay extends StatelessWidget {
  final AiChatViewState state;
  const AiChatDisplay(this.state);
  @override
  Widget build(BuildContext context) {
    var length = state.currentChat.isEmpty ? 0 : state.currentChat.length + 1;
    return ListView.builder(
      shrinkWrap: true,
      reverse: true,
      padding: EdgeInsets.zero,
      itemCount: length,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Center(
            child: ElevatedButton(
              // light gray background, fully rounded corners, low padding
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey[300],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30.0),
                ),
                padding: const EdgeInsets.symmetric(vertical: 3, horizontal: 10),
                // min height and width should be 0
                minimumSize: const Size(0, 0),
                // should not expand to fill the available space
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                elevation: 0
              ),
              onPressed: () {
                state.currentChat.clear();
                aiChatViewGlobalState.error = "";
                state.update();
                state.inputFocusNode.requestFocus();
              },
              child: const Text("New Chat", style: TextStyle(color: Color.fromARGB(255, 74, 156, 223), fontSize: 14)),
            ),
          );
        }
        var message = state.currentChat[length - index - 1];
        return ChatMessage(message);
      },
    );
  }
}
