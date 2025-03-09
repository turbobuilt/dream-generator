import 'package:dev/vars.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RecreateButton extends StatelessWidget {
  dynamic data;

  RecreateButton(this.data);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ButtonStyle(
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        backgroundColor: MaterialStateProperty.all(primaryBackground),
        padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 2, 10, 2)),
        minimumSize: MaterialStateProperty.all(const Size(0, 29)),
      ),
      onPressed: () async {
        if (createImageViewFeed.processing) {
          // show toast
          const snackBar = SnackBar(
            content: Text("Please wait for the current image to finish processing!"),
            backgroundColor: Color.fromARGB(255, 40, 39, 39),
            showCloseIcon: true,
            closeIconColor: Colors.white,
            duration: Duration(seconds: 2),
          );
          ScaffoldMessenger.of(context).showSnackBar(snackBar);
          return;
        }
        createImageViewHistory.promptNotifier.prompt.text = data.share["text"];
        createImageViewHistory.selectedStyle = data.share["style"];
        createImageViewHistory.update();
        customTabBarState.setTab(Views.createImageView);
        // tabBarState.update();
        SharedPreferences preferences = await SharedPreferences.getInstance();
        if (preferences.getBool("reimageTutorialShown") != true) {
          preferences.setBool("reimageTutorialShown", true);
          // show toast at top
          // ignore: prefer_const_constructors
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: const Text("Hit the 'Create' button to try it!"),
            backgroundColor: const Color.fromARGB(255, 40, 39, 39),
            // showCloseIcon: true,
            closeIconColor: Colors.white,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            // margin: EdgeInsets.only(bottom: MediaQuery.of(context).size.height - 150, left: 10, right: 10),
          ));
        }
      },
      child: const Text("Re-Create", style: TextStyle(fontSize: 13, fontWeight: FontWeight.normal)),
    );
  }
}
