import 'package:dev/lib/call_method.dart';
import 'package:dev/main.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:dev/views/chat_page/components/temporary_chat_popup.dart';
import 'package:dev/views/chat_page/components/video_link_display.dart';
import 'package:dev/views/chat_page/components/view_chat_message.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ChatMessageDisplay extends StatefulWidget {
  final Map chatMessageData;
  const ChatMessageDisplay(this.chatMessageData);

  @override
  ChatMessageDisplayState createState() => ChatMessageDisplayState();
}

class ChatMessageDisplayState extends State<ChatMessageDisplay> {
  @override
  Widget build(BuildContext context) {
    print(widget.chatMessageData);
    int createdMillis = widget.chatMessageData["chatMessage"]["created"];
    var dateTime = DateTime.fromMillisecondsSinceEpoch(createdMillis).toLocal();

    Locale locale = Localizations.localeOf(context);

    String formattedDate = DateFormat.yMMMMd(locale.toString()).format(dateTime);
    String formattedTime = DateFormat.jm(locale.toString()).format(dateTime);

    return GestureDetector(
      onTap: () async {
        if (!globalAuthenticatedUser.temporaryChatPopupShown) {
          globalAuthenticatedUser.temporaryChatPopupShown = true;
          await showDialog(
              context: context,
              builder: (context) {
                return TemporaryChatPopup();
              });
        }
        if (context.mounted) {
          var shown = await showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) {
              return ViewChatMessage(widget.chatMessageData["chatMessage"]);
            },
          );
          if (shown == true) {
            await callMethod("postMarkChatMessageTargetRead", [widget.chatMessageData["chatMessage"]["id"]]);
            chatPageState.chatMessages.remove(widget.chatMessageData);
            chatPageState.update();
          }
        }
      },
      child: Container(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            // mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.chatMessageData["chatMessage"]["videoCallLink"] != null)
                VideoLinkDisplay(widget.chatMessageData["chatMessage"]["videoCallLink"])
              else if (widget.chatMessageData["chatMessage"]["authenticatedUser"] == globalAuthenticatedUser.id)
                const Text("You sent a message")
              else
                const Text("You received a message"),
              Text("$formattedDate $formattedTime"),
            ],
          ),
        ),
      ),
    );
  }
}
