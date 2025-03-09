import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

showAlert(String message) async {
  print("error: $message");
  print("context is ${navigatorKey.currentContext}");

  await showDialog(
    context: navigatorKey.currentContext!,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('Alert'),
        content: Text(message + " error"),
        actions: [
          TextButton(
            onPressed: () {
              router.pop();
            },
            child: Text('OK'),
          ),
        ],
      );
    },
  );
}

showHttpErrorIfExists(Map data) {
  if (data['error'] != null) {
    showAlert(data['error'].toString());
    return true;
  }
  return false;
}


showHttpErrorIfExistsAsync(Map data) async {
  if (data['error'] != null) {
    await showAlert(data['error']);
    return true;
  }
  return false;
}

