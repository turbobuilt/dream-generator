import 'package:dev/helpers/router.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_avif/flutter_avif.dart';

class ChatMessageNotification extends StatelessWidget {
  final dynamic notification;

  const ChatMessageNotification(this.notification);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      // router.pushNamed("chat", queryParameters: {"authenticatedUserIds": [widget.profile["userName"].toString()]});
      onTap: () {
        chatPageState.setAuthenticatedUsers([notification['authenticatedUser']]);
        router.pushNamed("chat");
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        child: Row(
          children: <Widget>[
            notification['chatSenderPictureGuid'] != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(50),
                    child: AvifImage.network("https://images.dreamgenerator.ai/profile-pictures/${notification['originatorPictureGuid']}"),
                  )
                : const Icon(Icons.person),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(notification['originatorUserName']),
                const Text("You got a message."),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
