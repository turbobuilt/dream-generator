import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/notifications_view/notifications_state.dart';
import 'package:flutter/material.dart';
import '../../../helpers/network_helper.dart';

addFriend(int userId, BuildContext context) async {
  final result = await postRequest("/api/post-add-friend", Map<String, dynamic>.from({"friendId": userId}));
  if (result.error != null) {
    print(result.error);
  } else {
    print("Friend request sent");
  }
}

removeFriend(int userId, BuildContext context) async {
  final result = await postRequest("/api/post-remove-friend", Map<String, dynamic>.from({"friendId": userId}));
  if (result.error != null) {
    print(result.error);
  } else {
    print("Friend removed");
  }
}

class AddFriendButton extends StatefulWidget {
  final Map<dynamic, dynamic> profile;
  Function onUpdate;
  AddFriendButton({required this.profile, required this.onUpdate});

  @override
  AddFriendButtonState createState() => AddFriendButtonState();
}

class AddFriendButtonState extends BetterState<AddFriendButton> {
  @override
  Widget build(BuildContext context) {
    if (widget.profile["isFriend"] == true) {
      return Container();
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          const Text("Friends!", style: TextStyle(color: Colors.black, decoration: TextDecoration.none, fontSize: 16, fontWeight: FontWeight.normal)),
          const Spacer(),
          TextButton(
            onPressed: () {
              removeFriend(widget.profile["userId"], context);
              update(() {
                widget.profile['isFriend'] = false;
              });
            },
            child: const Text('Unfriend'),
          ),
        ],
      );
    }
    return ElevatedButton(
      onPressed: () {
        if (widget.profile['isFriend'] == true) {
          removeFriend(widget.profile["userId"], context);
          widget.profile['isFriend'] = false;
          update(() {});
          widget.onUpdate();
        } else {
          addFriend(widget.profile["userId"], context);
          widget.profile['isFriend'] = true;
          // remove notification
          notificationsState.notifications.removeWhere((element) => element["friendUserName"] == widget.profile["userName"]);
          notificationsState.update();

          update(() {});
          widget.onUpdate();
        }
      },
      child: widget.profile['isFriend'] == true ? const Text('Unfriend') : const Text('Add friend'),
    );
  }
}
