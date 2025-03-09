import 'package:dev/helpers/router.dart';
import 'package:dev/views/share_card/components/block_user_modal.dart';
import 'package:dev/views/share_view/components/share_view_report_share_modal.dart';
import 'package:flutter/material.dart';

class ShareViewBottomBar extends StatelessWidget {
  Map<dynamic, dynamic> share;
  ShareViewBottomBar({required this.share});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: true,
      top: false,
      right: true,
      left: true,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          TextButton(
            onPressed: () async {
              print("bad post");
              router.pop();
              await showBlockUserModal(context, share);
              // await showShareViewReportShareModal(context, share);
            },
            child: const Text(
              'Block User',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),
          TextButton(
            onPressed: () async {
              print("bad post");
              router.pop();
              await showBlockUserModal(context, share, reason: "report");
              // await showShareViewReportShareModal(context, share);
            },
            child: const Text(
              'Report User',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),

          const Spacer(),
          // button saying "report post" text button
          TextButton(
            onPressed: () async {
              print("bad post");
              router.pop();
              await showShareViewReportShareModal(context, share);
            },
            child: const Text(
              'Report Post',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),
          // const Spacer()
        ],
      ),
    );
  }
}
