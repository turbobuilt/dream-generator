import 'package:dev/helpers/router.dart';
import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:dev/views/chat_page/components/chat_message_display.dart';
import 'package:dev/views/chat_page/components/text_chat_input.dart';
import 'package:dev/widgets/pretty_app_bar.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ChatPage extends SmartWidget {
  GoRouterState routerState;
  ChatPage(this.routerState) {
    state = chatPageState;
  }

  @override
  Widget render(BuildContext context) {
    return Material(
      color: Colors.white,
      child: Scaffold(
        body: Column(
          children: [
            PrettyAppBar(title: "Chat"),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  await chatPageState.getChatMessages();
                },
                child: ListView.builder(
                  padding: const EdgeInsets.all(0),
                  itemCount: chatPageState.chatMessages.length,
                  itemBuilder: (context, index) {
                    var message = chatPageState.chatMessages[index];
                    return ChatMessageDisplay(message);
                  },
                ),
              ),
            ),
            if (chatPageState.gettingMessages)
              Container(
                padding: const EdgeInsets.all(10),
                child: const CircularProgressIndicator(),
              ),
            if (chatPageState.showingTextChat)
              TextChatInput(sendMessage: (message) async {
                print("sending message: $message");
                var result = await callMethod("postSubmitTextChatMessage", [chatPageState.authenticatedUsers, message]);
                if (showHttpErrorIfExists(result)) return false;
                chatPageState.chatMessages.add({
                  "chatMessage": result["chatMessage"],
                });
                chatPageState.update();
                return true;
              })
            else
              ElevatedButton(
                onPressed: () {
                  chatPageState.showingTextChat = true;
                  chatPageState.update();
                },
                child: const Text("Text"),
              ),
            SafeArea(bottom: false, child: Container())
          ],
        ),
      ),
    );
  }
}
