import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';

showNoSubscriptionNoticeModal(BuildContext context) async {
  globalAuthenticatedUser.trialDeclined = true;
  globalStore.saveUserData().catchError((error) {
    print("error saving user data");
    print(error);
  });
  globalStore.saveUserDataToServer().catchError((error) {
    print("error saving user data to server");
    print(error);
  });
  
  return await showDialog(context: context, builder: (context) => NoSubscriptionNoticeModal());
}

class NoSubscriptionNoticeModal extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text("You Are Awesome", textAlign: TextAlign.center),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Hello,"),
          const SizedBox(height: 10),
          const Text("In order to help get this app out to people, we have to charge a fee.  But if you can't afford it, we will show ads so you can keep using it, courtesy of our advertisers."),
          // Row with two buttons space between left: Upgrade, right: Accept Ads
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ElevatedButton(
                onPressed: () {
                  router.pop(true);
                },
                child: const Text("Upgrade"),
              ),
              ElevatedButton(
                onPressed: () {
                  router.pop(false);
                },
                child: const Text("Accept Ads"),
              ),
            ],
          ),
        ],
      ),
    );
  }
}