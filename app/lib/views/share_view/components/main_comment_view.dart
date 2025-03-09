import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/share_view/components/share_children_component/share_children_component.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../helpers/network_helper.dart';
import '../../../helpers/router.dart';
import '../../../vars.dart';
import '../../../widgets/RefreshController.dart';
import '../../main_view/components/main_tab_bar.dart';
import '../../main_view/main_view.dart';
import '../share_view.dart';

class MainCommentView extends StatelessWidget {
  Map<String, dynamic> share = {};
  var textController = TextEditingController();
  var error = "";
  var savingComment = false;
  late List<dynamic> comments;
  late ShareChildrenComponent commentsView;
  var refreshController = RefreshController();

  MainCommentView(this.share, this.comments, this.commentsView) {
    print("MAKING MAIN COMMENT VIEW");
    textController.addListener(() {
      print(textController.text);
      print("updating");
      refreshController.update();
    });
  }

  Future saveComment() async {
    if (savingComment) {
      return;
    }
    error = "";
    savingComment = true;
    refreshController.update();
    print("saving ccomment");
    savingComment = true;
    refreshController.update();
    final err = await mainSaveComment(textController.text, null, share, comments);
    savingComment = false;
    if (err?.isNotEmpty == true) {
      print("Error saving comment");
      print(err);
      error = "Error saving comment.  Contact support@dreamgenerator.ai for help";
      refreshController.update();
      commentsView.update();
      return error;
    }
    textController.text = "";
    refreshController.update();
    commentsView.update();
  }

  @override
  Widget build(BuildContext context) {
    return refreshController.setChild(
      () => Column(
        children: [
          // button full width that says "Copy Prompt"
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
            child: ElevatedButton(
              style: ButtonStyle(
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                backgroundColor: MaterialStateProperty.all(primaryBackground),
                padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 5, 10, 5)),
                minimumSize: MaterialStateProperty.all(Size(MediaQuery.sizeOf(context).width - 10, 0)),
              ),
              onPressed: () => {
                createImageViewHistory.promptNotifier.prompt.text = share["text"],
                createImageViewHistory.selectedStyle = share["style"],
                createImageViewHistory.update(),
                customTabBarState.setTab(Views.createImageView),
                router.pop()
              },
              child: savingComment ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator()) : const Text("Remix Image"),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(5, 0, 5, 5),
            child: TextField(
              controller: textController,
              autofocus: true,
              decoration: const InputDecoration(isDense: true, labelText: 'Your Comment'),
              onSubmitted: (value) => saveComment(),
              textInputAction: TextInputAction.send,
            ),
          ),
          if (textController.text.isNotEmpty) ...{
            Row(
              children: [
                ElevatedButton(
                  style: ButtonStyle(
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    backgroundColor: MaterialStateProperty.all(primaryBackground),
                    padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 5, 10, 5)),
                    minimumSize: MaterialStateProperty.all(Size(MediaQuery.sizeOf(context).width - 10, 0)),
                  ),
                  onPressed: () => saveComment(),
                  child: savingComment ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator()) : const Text("Comment"),
                ),
              ],
            ),
            const SizedBox(height: 10),
          },
        ],
      ),
    );
  }
}

Future mainSaveComment(String text, int? parentIndex, Map<dynamic, dynamic> share, List comments) async {
  print("saving ccomment");
  final result = await postRequest("/api/share", {
    "parent": parentIndex == null ? share["id"] : comments[parentIndex]["id"],
    "text": text,
  });
  if (result.error?.isNotEmpty == true) {
    print("Error saving comment");
    print(result.error);
    return "Error saving comment.  Contact support@dreamgenerator.ai for help";
  }
  if (parentIndex == null) {
    comments.insert(0, result.result);
  } else {
    comments.insert(parentIndex + 1, result.result);
  }
  if (share["children"] != null && parentIndex == null) {
    share["children"].insert(0, result.result);
    // limit to 3
    if (share["children"].length > 3) {
      share["children"].removeLast();
    }
    print("saved comment");
  } else {
    print("share children is null");
  }
}
