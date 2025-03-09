import 'package:dev/views/share_card/components/share_card_more_options_modal.dart';
import 'package:dev/views/share_view/components/share_children_component/share_children_component.dart';
import 'package:dev/widgets/RefreshController.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ReportComment extends StatelessWidget {
  final Map<String, dynamic> comment;
  final RefreshController refreshController;

  const ReportComment(this.comment, this.refreshController);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final status = await showShareCardMoreOptionsModal(context, comment, isChild: true);
        if (status == true) {
          // comment["text"] = "[Deleted]";\
          comment["objectionableContentCount"] = 1;
          refreshController.update();
        }
      },
      child: const Padding(padding: EdgeInsets.symmetric(vertical: 5), child: Icon(Icons.more_horiz)),
    );
  }
}
