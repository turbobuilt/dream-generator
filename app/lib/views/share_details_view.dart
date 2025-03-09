import 'package:dev/helpers/network_helper.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/share_credit_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'display_all_images_view.dart' show globalDisplayAllImagesViewStore;
import '../helpers/router.dart';
import '../main.dart';
import 'my_likes.dart';

class ShareDetailsView extends StatelessWidget with ChangeNotifier {
  var share = {};
  var error = "";
  var unpublishing = false;

  ShareDetailsView(info) {
    share = routeData;
  }

  unpublish() async {
    if (unpublishing) {
      return;
    }
    unpublishing = true;
    notifyListeners();
    final response = await deleteRequest("/api/share/${share["id"]}");
    if (response.error != null && response.error != "") {
      error = response.error ?? "error";
      unpublishing = false;
      notifyListeners();
      return;
    }
    unpublishing = false;
    // load all images mostRecentShare
    globalDisplayAllImagesViewStore.imagePaths;
    for (var i = 0; i < globalDisplayAllImagesViewStore.imagePaths.length; ++i) {
      var path = globalDisplayAllImagesViewStore.imagePaths[i];
      try {
        var imageData = await CurrentImageData.load(path.split("/").last);
        if (imageData?.mostRecentShare == share["id"]) {
          imageData?.mostRecentShare = null;
          imageData?.promptId = null;
          imageData?.save();
        }
      } catch (err) {
        print("error loading data");
        print(err);
      }
    }

    myLikesState.refreshLikes();
    router.pop();
  }

  @override
  Widget build(BuildContext context) {
    context = context;
    return Scaffold(
      body: ChangeNotifierProvider.value(
        value: this,
        child: Consumer<ShareDetailsView>(builder: (context, data, child) {
          return Column(
            children: [
              Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.blue, Colors.purple],
                    ),
                  ),
                  child: AppBar(title: const Text(''))),
              //
              const SizedBox(height: 30),
              ElevatedButton(
                style: ElevatedButton.styleFrom(minimumSize: Size(MediaQuery.of(context).size.width * .8, 50)),
                onPressed: unpublish,
                child: Text(unpublishing ? "Unpublishing..." : "Unpublish"),
              ),
              SizedBox(height: 30),
              if (error.isNotEmpty) Text(error, style: const TextStyle(color: Colors.red)),
            ],
          );
        }),
      ),
    );
  }
}
