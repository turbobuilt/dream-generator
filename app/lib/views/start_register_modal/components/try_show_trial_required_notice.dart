import 'package:dev/main.dart';
import 'package:flutter/material.dart';

tryShowTrialRequiredNotice(BuildContext context) async {
  // show alert if user is null saying you have to start trial if not signed in with social
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (globalAuthenticatedUser.id == 0 || globalAuthenticatedUser.id == null) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Verification Required'),
            content: const Text('In order to combat spam, you must either use a social login (Apple or Google for now), or start with a plan.  If you don\'t want to pay any money, just use social login, and you will get free credits to get started.  Enjoy!'),
            actions: <Widget>[
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: const Text('OK'),
              ),
            ],
          );
        },
      );
    }
  });
}
