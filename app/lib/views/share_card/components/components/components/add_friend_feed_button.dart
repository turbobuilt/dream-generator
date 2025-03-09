import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/user_public_profile/components/add_friend_button.dart';
import 'package:flutter/material.dart';

class AddFriendFeedButton extends StatefulWidget {
  dynamic data;

  AddFriendFeedButton(this.data);

  @override
  AddFriendFeedButtonState createState() => AddFriendFeedButtonState();
}

class AddFriendFeedButtonState extends BetterState<AddFriendFeedButton> {
  @override
  Widget build(BuildContext context) {
    if (widget.data.share["isFriend"] != null)
      return Container();
    else
      return ElevatedButton(
        style: ButtonStyle(
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          // backgroundColor: MaterialStateProperty.all(Colors.white),
          padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 2, 10, 2)),
          minimumSize: MaterialStateProperty.all(const Size(0, 29)),
        ),
        onPressed: () async {
          await addFriend(widget.data.share["userId"], context);
          widget.data.share["isFriend"] = 1;
          update();

          // show toast
          if (context.mounted) {
            const snackBar = SnackBar(
              content: Text("Friend added"),
              backgroundColor: Color.fromARGB(255, 40, 39, 39),
              showCloseIcon: true,
              closeIconColor: Colors.white,
              duration: Duration(seconds: 2),
            );
            ScaffoldMessenger.of(context).showSnackBar(snackBar);
          }
        },
        child: const Text("Friend", style: TextStyle(fontSize: 13)),
      );
  }
}
