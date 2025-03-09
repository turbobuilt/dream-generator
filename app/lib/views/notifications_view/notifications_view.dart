import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/notifications_view/components/chat_message_notification.dart';
import 'package:dev/views/notifications_view/components/friend_add_notification.dart';
import 'package:dev/views/notifications_view/notifications_state.dart';
import 'package:dev/widgets/small_app_bar.dart';
import 'package:flutter/material.dart';

class NotificationsView extends SmartWidget<NotificationsState> {
  NotificationsView() {
    state = notificationsState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      color: Colors.white,
      width: MediaQuery.of(context).size.width,
      child: Column(
        children: [
          SmallAppBar(title: "Notifications"),
          state.notifications.isEmpty
              ? Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Center(child: state.error.isNotEmpty ? Text(state.error) : const Text("Your up to date!")),
                )
              : Expanded(
                child: ListView.builder(
                    padding: const EdgeInsets.all(0),
                    itemCount: state.notifications.length,
                    itemBuilder: (context, index) {
                      var notification = state.notifications[index] as Map<String, dynamic>;
                      if (notification["friendUserName"] != null) {
                        return FriendAddNotification(notification);
                      } else if (notification["chatMessage"] != null) {
                        return ChatMessageNotification(notification);
                      } else {
                        return const Text("Error");
                      }
                    },
                  ),
              ),
        ],
      ),
    );
  }
}
