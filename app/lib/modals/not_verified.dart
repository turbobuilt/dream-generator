import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:flutter/material.dart';
import 'package:icons_plus/icons_plus.dart';
import '../controllers/login_page_controller.dart';
import '../helpers/login.dart';
import '../helpers/router.dart';
import '../main.dart';


showNotVerifiedModal(BuildContext context) {
  var loadingGoogle = false;
  var error = "";
  return showDialog(
    context: context,
    builder: (BuildContext context) {
      return StatefulBuilder(builder: (context, buildContextSetState) {
        return AlertDialog(
          title: const Text(
              "To combat fraud, you must subscribe or verify your email to get credits. We apologize for the inconvenience, but must be responsible to make sure we can give you the best experience possible."),
          actionsAlignment: MainAxisAlignment.spaceBetween,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text("If you sign in with Google or Apple you can make a bunch of images for free."),
              Text(error, style: const TextStyle(color: Colors.red)),
              ElevatedButton(
                onPressed: () async {
                  buildContextSetState(() {
                    loadingGoogle = true;
                    error = "";
                  });
                  final result = await googleSignInPressed();
                  if (result.success) {
                    router.pop();
                  } else {
                    buildContextSetState(() {
                      loadingGoogle = false;
                      error = result.error;
                    });
                  }
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
                  minimumSize: Size(MediaQuery.of(context).size.width * .8, 40),
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Brand(Brands.google),
                      const SizedBox(width: 15),
                      Text(loadingGoogle ? 'Working...' : 'Sign in with Google', style: const TextStyle(fontSize: 20)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                router.pop();
              },
              child: const Text("Try Later"),
            ),
            ElevatedButton(
              onPressed: () {
                router.pop();
                router.push("/share-credit");
              },
              child: const Text("Share"),
            ),
            ElevatedButton(
              onPressed: () {
                router.pop();
                // router.push("/purchase");
                customTabBarState.setTab(Views.purchasesView);
              },
              child: const Text("Upgrade Now"),
            ),
          ],
        );
      });
    },
  );
}
