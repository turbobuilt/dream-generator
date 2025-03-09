
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ShareCardViewData extends ChangeNotifier {
  BuildContext? context;
  var updatingLikeStatus = false;
  var commentTextController = TextEditingController();
  late Map<String, dynamic> share;
  var postingComment = false;

  ShareCardViewData() {
    commentTextController.addListener(() {
      notifyListeners();
    });
  }

  showError(String error) {
    ScaffoldMessenger.of(context!).showSnackBar(SnackBar(
      content: Text(error),
      backgroundColor: const Color.fromARGB(255, 40, 39, 39),
      showCloseIcon: true,
      closeIconColor: Colors.white,
      duration: const Duration(hours: 1),
    ));
  }

  submitComment() async {
    if (postingComment) {
      return;
    }
    postingComment = true;
    notifyListeners();
    print("comment is ${commentTextController.text}");
    var response = await postRequest("/api/share", {
      "parent": share["id"],
      "text": commentTextController.text,
    });
    if (response.error != null) {
      print("error: ${response.error}");
      postingComment = false;
      notifyListeners();
      showError(response.error ?? "error");
      return;
    }
    commentTextController.text = "";
    postingComment = false;
    if (share["children"] != null) {
      share["children"].insert(0, response.result);
      // limit to 3
      if (share["children"].length > 3) {
        share["children"].removeLast();
      }
      print("saved comment");
    }
    notifyListeners();
  }

  like(share) async {
    if (updatingLikeStatus) {
      return;
    }
    updatingLikeStatus = true;
    notifyListeners();
    var response = await postRequest("/api/share-like", {
      "share": share["id"],
    });
    if (response.error != null) {
      print("error: ${response.error}");
      showError(response.error ?? "error");
      updatingLikeStatus = false;
      notifyListeners();
      return;
    }

    //update creditsRemaining
    print("response.result: ${response.result}");
    if (response.result["creditsRemaining"] != null) {
      globalAuthenticatedUser.creditsRemaining = double.tryParse((response.result["creditsRemaining"] ?? 0).toString()) ?? 0;
      globalStore.saveUserData();
      print("The new credits are ${globalAuthenticatedUser.creditsRemaining}");
      // globalTopBarViewData.notifyListeners();
      mainViewState.update();
    }
    if (response.result["newCredits"] > 0) {
      // check if sharedPreferences likeCreditsMessage shown
      SharedPreferences prefs = await SharedPreferences.getInstance();
      if (prefs.getBool("likeCreditsMessageShown") != true) {
        prefs.setBool("likeCreditsMessageShown", true);
        // show alert
        showDialog(
          context: context!,
          builder: (context) {
            return AlertDialog(
              title: const Text("You got 1 credit!"),
              content: const Text(
                  "You get 1 credit every time you like a post! Please only like responsibly. Credits can be used on images.  (Note, limited in time and number per day to 3. Also can't do this forever, only 10 days max. Thanks for trying the app hope you get into it and enjoy. And buy a subscription if you want to support development, we love you!)"),
              actions: [
                TextButton(
                  onPressed: () {
                    router.pop();
                  },
                  child: const Text("OK"),
                ),
              ],
            );
          },
        );
      }
    }

    share["liked"] = 1;
    share["likesCount"] += 1;
    updatingLikeStatus = false;
    notifyListeners();
  }

  unlike(share) async {
    if (updatingLikeStatus) {
      return;
    }
    updatingLikeStatus = true;
    var response = await deleteRequest("/api/share-like?share=${share["id"]}");
    if (response.error != null) {
      print("error: ${response.error}");
      updatingLikeStatus = false;
      notifyListeners();
      return;
    }
    share["liked"] = 0;
    share["likesCount"] -= 1;
    updatingLikeStatus = false;
    notifyListeners();
  }
}