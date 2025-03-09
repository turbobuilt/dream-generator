import 'package:dev/views/share_card/components/share_card_more_options_modal.dart';
import 'package:dev/views/share_view/components/share_children_component/components/report_comment.dart';
import 'package:flutter/material.dart';

import '../../../../../vars.dart';
import '../../../../../widgets/LikeButton.dart';
import '../../../../../widgets/RefreshController.dart';
import '../share_children_component.dart';

shareChildItem(BuildContext context, ShareChildrenComponent parent, List<dynamic> comments, Map<String, dynamic> share, int index) {
  final comment = comments[index];
  var replyTextController = TextEditingController();
  var refreshController = RefreshController();
  var savingComment = false;
  var error = "";
  postComment() async {
    if (savingComment) {
      return;
    }
    error = "";
    savingComment = true;
    refreshController.update();
    print("text is ${replyTextController.text}");
    await parent.saveComment(index, replyTextController);
    savingComment = false;
    refreshController.update();
  }

  replyTextController.addListener(() {
    print(replyTextController.text);
    print("updating");
    refreshController.update();
  });
  // compute indent level by finding parent by looping reverse.  Each time parent is found, add 1 to indent level.  Keep going until parent is null
  double indentLevel = 0;
  var currentCommentParent = comment["parent"];
  while (currentCommentParent != share["id"]) {
    indentLevel++;
    if (indentLevel > 5) {
      print("ERROR WILE TOO LONG");
      break;
    }
    var found = false;
    for (var i = index - 1; i >= 0; i--) {
      if (comments[i]["id"] == currentCommentParent) {
        currentCommentParent = comments[i]["parent"];
        found = true;
        break;
      }
    }
    if (!found) {
      print("error finding comment parent");
      print(comment);
      break;
    }
  }
  return refreshController.setChild(
    () => Padding(
      padding: comment["parent"] == currentCommentParent ? const EdgeInsets.all(0) : EdgeInsets.only(left: 15 * indentLevel),
      child: GestureDetector(
        onTap: () {
          if (comment["childrenLoaded"] == true) {
            parent.deleteChildren(index);
            return;
          }
          parent.loadComments(comment["id"]);
        },
        child: Container(
          // border 1px solid grey
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: Colors.grey[300]!,
                width: 1,
              ),
            ),
          ),
          // padding: const EdgeInsets.only(top: 4),
          child: Padding(
            padding: const EdgeInsets.all(7),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text((comment["objectionableContentCount"] == 0 ? (comment["text"] ?? "Empty") : "[Deleted]"),
                        style: const TextStyle(fontSize: 17)),
                    const SizedBox(width: 5),
                    const Spacer(),
                    if (!parent.loadAll) ...{
                      Padding(
                        padding: const EdgeInsets.all(0),
                        child: ReportComment(comment, refreshController),
                      )
                    }
                  ],
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Flexible(
                      child: Column(
                        children: [
                          if (indentLevel < 3 && parent.loadAll) ...{
                            const SizedBox(height: 4),
                            TextField(
                              controller: replyTextController,
                              decoration: InputDecoration(
                                hintText: "Respond ${(comment["childCount"] ?? 0) > 0 ? "or view ${comment["childCount"]} replies" : ""}",
                                contentPadding: const EdgeInsets.only(bottom: 4),
                                isDense: true,
                              ),
                              maxLines: 10,
                              minLines: 1,
                              textInputAction: TextInputAction.send,
                              onSubmitted: (value) => postComment(),
                              onTap: () => parent.loadComments(comment["id"]),
                            ),
                          },
                          if (replyTextController.text.isNotEmpty) ...{
                            const SizedBox(height: 7),
                            if (error != "") ...{
                              Text(error, style: const TextStyle(color: Colors.red)),
                              const SizedBox(height: 7),
                            },
                            LayoutBuilder(
                              builder: (context, constraints) {
                                return ElevatedButton(
                                  style: ButtonStyle(
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    backgroundColor: MaterialStateProperty.all(primaryBackground),
                                    padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 5, 10, 5)),
                                    minimumSize: MaterialStateProperty.all(Size(constraints.maxWidth, 0)),
                                  ),
                                  onPressed: postComment,
                                  child: savingComment
                                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white))
                                      : const Text("Comment"),
                                );
                              },
                            )
                          }
                        ],
                      ),
                    ),
                    if (parent.loadAll) ...{
                      ReportComment(comment, refreshController),
                      Padding(
                        padding: const EdgeInsets.only(top: 6, left: 5),
                        child: Text("+${comment["likesCount"]}", style: const TextStyle(fontSize: 16)),
                      ),
                      const SizedBox(width: 10),
                      LikeButton(comment, () => parent.like(comment), () => parent.unlike(comment)),
                    }
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
