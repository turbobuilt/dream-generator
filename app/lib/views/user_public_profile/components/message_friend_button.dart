import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:flutter/material.dart';

class MessageFriend extends StatefulWidget {
  final Map<dynamic, dynamic> profile;
  const MessageFriend({required this.profile});

  @override
  MessageFriendState createState() => MessageFriendState();
}

class MessageFriendState extends BetterState<MessageFriend> {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        // open chat
        chatPageState.setAuthenticatedUsers([widget.profile["userId"]]);
        router.pushNamed("chat");
      },
      child: const Text('Chat'),
    );
  }
}
