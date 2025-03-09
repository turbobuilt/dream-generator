import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:flutter/material.dart';

showBlockUserModal(BuildContext context, Map<dynamic, dynamic> share, {String reason = ""}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        content: ShowBlockUserModal(share: share, reason: reason),
        insetPadding: const EdgeInsets.all(10),
        // contentPadding: const EdgeInsets.all(10),
      );
    },
  );
}

class ShowBlockUserModal extends StatefulWidget {
  final Map<dynamic, dynamic> share;
  final String reason;
  const ShowBlockUserModal({required this.share, required this.reason});

  @override
  ShowBlockUserModalState createState() => ShowBlockUserModalState();
}

class ShowBlockUserModalState extends BetterState<ShowBlockUserModal> {
  bool loading = false;
  String? error;
  bool success = false;
  blockUser(int userId, String reason) async {
    print("blocking user $userId");
    update(() => loading = true);
    await Future.delayed(const Duration(seconds: 2));
    var result = await postRequest(
        "/api/post-block-authenticated-user",
        Map<String, dynamic>.from({
          "authenticatedUserId": userId,
          "reason": reason,
        }));
    if (result.error != null) {
      update(() => error = result.error);
    } else {
      update(() => success = true);
    }
    update(() {
      loading = false;
    });
    feedView.items?.removeWhere((element) => element["userId"] == userId);
    feedView.update();
  }

  @override
  Widget build(BuildContext context) {
    var buttonStyle = ButtonStyle(
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      backgroundColor: MaterialStateProperty.all(Colors.white),
      padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 5, 10, 5)),
      minimumSize: MaterialStateProperty.all(Size(MediaQuery.sizeOf(context).width - 10, 0)),
    );
    const textStyle = TextStyle(color: Colors.black, fontSize: 16);
    if (loading || success || error?.isNotEmpty == true) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (loading)
            const Center(child: CircularProgressIndicator())
          else if (success) ...{
            const Text("Blocked", style: textStyle),
            const SizedBox(height: 15),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: buttonStyle,
              child: const Text('Close', style: textStyle),
            ),
          } else if (error?.isNotEmpty == true)
            Text("Error: $error", style: textStyle),
        ],
      );
    }
    return SizedBox(
      width: double.maxFinite,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text("Why are you ${widget.reason.isNotEmpty ? widget.reason : 'block'}ing this user?", style: const TextStyle(color: Colors.black, fontSize: 20)),
          const SizedBox(height: 4),
          const Text("This helps us with moderation.", style: textStyle),
          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: () => blockUser(widget.share["userId"], "spam"),
            style: buttonStyle,
            child: const Text('Spam', style: textStyle),
          ),
          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: () => blockUser(widget.share["userId"], "harassment"),
            style: buttonStyle,
            child: const Text('Harassment', style: textStyle),
          ),
          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: () => blockUser(widget.share["userId"], "ugly"),
            style: buttonStyle,
            child: const Text('Their stuff is ugly', style: textStyle),
          ),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: buttonStyle,
            child: const Text('Cancel', style: textStyle),
          ),
        ],
      ),
    );
  }
}
