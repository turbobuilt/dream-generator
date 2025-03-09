import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/views/share_card/components/block_user_modal.dart';
import 'package:dev/views/share_view/components/share_view_report_share_modal.dart';
import 'package:flutter/material.dart';

showShareCardMoreOptionsModal(
  BuildContext context,
  Map<dynamic, dynamic> share, {
  bool isChild = false,
}) async {
  return await showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        content: ShareCardMoreOptionsModal(share: share, isChild: isChild),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      );
    },
  );
}

class ShareCardMoreOptionsModal extends StatefulWidget {
  final Map<dynamic, dynamic> share;
  final bool isChild;
  const ShareCardMoreOptionsModal({
    required this.share,
    required this.isChild,
  });

  @override
  ShareCardMoreOptionsModalState createState() => ShareCardMoreOptionsModalState();
}

class ShareCardMoreOptionsModalState extends BetterState<ShareCardMoreOptionsModal> {
  bool loading = false;
  String? error;
  bool success = false;
  @override
  Widget build(BuildContext context) {
    // button style width 100% align left,
    // var buttonStyle = ButtonStyle(
    //   tapTargetSize: MaterialTapTargetSize.shrinkWrap,
    //   backgroundColor: MaterialStateProperty.all(Colors.white),
    //   padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 5, 10, 5)),
    //   minimumSize: MaterialStateProperty.all(Size(MediaQuery.sizeOf(context).width - 10, 0)),
    // );
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        MaterialButton(
          padding: EdgeInsets.zero,
          onPressed: () async {
            Navigator.of(context).pop();
            showBlockUserModal(context, widget.share, reason: "report");
          },
          child: const Text('Report User'),
        ),
        const SizedBox(height: 2),
        MaterialButton(
          padding: EdgeInsets.zero,
          onPressed: () async {
            Navigator.of(context).pop();
            showBlockUserModal(context, widget.share);
          },
          child: const Text('Block User'),
        ),
        const SizedBox(height: 2),
        MaterialButton(
          onPressed: () async {
            Navigator.of(context).pop(true);
            showShareViewReportShareModal(context, widget.share);
          },
          child: Text('Report ${widget.isChild ? "Comment" : "Post"}'),
        ),
      ],
    );
  }
}
