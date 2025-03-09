import 'package:dev/views/share_view/components/share_children_component/components/share_child_item.dart';
import 'package:dev/views/share_view/components/shared_images_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../helpers/network_helper.dart';
import '../../../../vars.dart';
import '../../../../widgets/LikeButton.dart';
import '../../../../widgets/RefreshController.dart';
import '../../share_view.dart';
import '../main_comment_view.dart';

class ShareChildrenComponent extends StatelessWidget with ChangeNotifier {
  Map<String, dynamic> share = {};
  var comments = [];
  var comment = "";
  var error = "";
  var commentsError = "";
  var saving = false;
  int? currentCommentParent;
  var loadAll = false;
  var images = [];

  ShareChildrenComponent(info, this.loadAll) {
    share = info;
    comments.insertAll(0, share["children"]);
    if (loadAll) {
      loadComments(null);
    }
  }

  update() {
    notifyListeners();
  }

  loadComments(dynamic parent) async {
    var loadImages = loadAll && parent == null ? "true" : "";
    var levels = parent == null ? "2" : "";
    var url = "/api/share-children?share=${parent ?? share["id"]}&loadImages=$loadImages&levels=$levels";
    print(url);
    final response = await getRequest(url);
    if (response.error != "" && response.error != null) {
      print("Error loading comments");
      print(response.error);
      commentsError =
          response.error ?? "Error loading comments.  Contact support@dreamgenerator.ai to report bugs. Thank you and I apologize for the problem!";
      return;
    }
    var insertIndex = 0;
    if (parent != null) {
      var parentIndex = comments.indexWhere((element) => element["id"] == parent);
      comments[parentIndex]["childrenLoaded"] = true;
      insertIndex = parentIndex + 1;
    } else {
      for (var i = 0; i < response.result["items"].length; i++) {
        if (response.result["items"][i]["parent"] == null) {
          response.result["items"][i]["childrenLoaded"] = true;
        }
      }
    }
    if ((response.result as Map<String, dynamic>).containsKey("images")) {
      images = response.result["images"];
    }
    if (insertIndex == 0) {
      comments.clear();
    }
    comments.insertAll(insertIndex, response.result["items"]);
    // comments.insertAll(insertIndex, response.result["items"]);
    notifyListeners();
  }

  Future like(Map<String, dynamic> comment) async {
    print("liking");
    final response = await postRequest("/api/share-like", {"share": comment["id"]});
    if (response.error != "" && response.error != null) {
      print("Error liking comment");
      print(response.error);
      error = response.error ?? "Error liking comment.  Contact support@dreamgenerator.ai for help";
    }
    comment["likesCount"] = comment["likesCount"] + 1;
    comment["liked"] = 1;
    notifyListeners();
  }

  Future unlike(Map<String, dynamic> comment) async {
    final response = await deleteRequest("/api/share-like?share=${comment["id"]}");
    if (response.error != "" && response.error != null) {
      print("Error unliking comment");
      print(response.error);
      error = response.error ?? "Error unliking comment.  Contact support@dreamgenerator.ai for help";
    }
    comment["likesCount"] = comment["likesCount"] - 1;
    comment["liked"] = 0;
    notifyListeners();
  }

  Future saveComment(int? index, TextEditingController textController) async {
    if (saving) {
      return;
    }
    saving = true;
    notifyListeners();
    final error = await mainSaveComment(textController.text, index, share, comments);
    if (error?.isNotEmpty == true) {
      print("Error saving comment");
      print(error);
      this.error = error;
      saving = false;
      notifyListeners();
      return;
    }
    textController.text = "";
    notifyListeners();
  }

  deleteChildren(int index) {
    final parent = comments[index]["id"];
    for (var i = index + 1; i < comments.length;) {
      if (comments[i]["parent"] == parent) {
        deleteChildren(i);
        comments.removeAt(i);
      } else {
        break;
      }
    }
    comments[index]["childrenLoaded"] = false;
    notifyListeners();
  }

  @override
  Widget build(BuildContext context) {
    context = context;
    return Column(mainAxisSize: MainAxisSize.min, children: [
      if (loadAll) MainCommentView(share, comments, this),
      ChangeNotifierProvider.value(
        value: this,
        child: Consumer<ShareChildrenComponent>(
          builder: (context, data, child) {
            var list = ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.all(0),
              physics: const BouncingScrollPhysics(),
              itemCount: comments.length,
              itemBuilder: (context, index) {
                return shareChildItem(context, this, comments, share, index);
              }
            );
            // return Container();
            if (loadAll) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (images.isNotEmpty) SharedImagesView(images),
                  Flexible(child: list),
                ],
              );
            } else {
              return list;
            }
          },
        ),
      ),
      // if (loadAll) const SafeArea(bottom: true, child: SizedBox(height: 0)),
    ]);
  }
}
