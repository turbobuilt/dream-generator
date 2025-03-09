import 'package:dev/main.dart';
import 'package:flutter/material.dart';

showRestorePurchasesPressedModal(BuildContext context) async {
  purchaseViewData.restorePurchases();
  // show simple alert containing text widget stating it's working on restoring purchases if any exist
  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text("Restoring Purchases"),
        content: const Text(
            "Working on restoring your purchases if you have any. It takes almost 10 seconds to get started because of iOS functionality. Please be patient. Right now, there's no simple way to keep track of it, so just hang on."),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text("OK"),
          ),
        ],
      );
    },
  );
}
