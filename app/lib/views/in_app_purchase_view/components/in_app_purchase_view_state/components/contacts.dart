import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:provider/provider.dart';

import '../in_app_purchase_view_state.dart';

showShareContactsAlert() {
  showDialog(
    context: router.configuration.navigatorKey.currentContext!,
    builder: (context) => ChangeNotifierProvider.value(
      value: purchaseViewData,
      child: Consumer<InAppPurchaseViewState>(
        builder: (context, notifier, child) => AlertDialog(
          title: const Text("Share Contacts"),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("If you share your contacts you get 100 free credits."),
              SizedBox(height: 10),
              Text(
                  "When you click 'Share', the app will upload all of your contacts, including email addresses and names so that we can email them."),
              SizedBox(height: 10),
              Text("We will send an email to each contact about Dream Generator."),
              SizedBox(height: 10),
              Text("We will be polite, and your name will not be included."),
              SizedBox(height: 10),
              Text(
                  "We will not delete these contacts to make sure that we don't spam them. If many people share the same email for example, we want to make sure we don't send a new email every time!"),
              SizedBox(height: 10),
              Text("By sharing your contacts, you help the app grow without expensive advertising. More fun for all, for less.")
              // if (error.isNotEmpty) Text(error),
            ],
          ),
          actions: [
            Row(
              children: [
                TextButton(
                  onPressed: () {
                    router.pop(false);
                  },
                  child: const Text("Cancel"),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: shareContacts,
                  child: Text(purchaseViewData.sharingContacts ? "Working..." : "Share Contacts"),
                ),
              ],
            )
          ],
        ),
      ),
    ),
  );
}

shareContacts() async {
  if (purchaseViewData.sharingContacts) {
    return false;
  }
  purchaseViewData.sharingContacts = true;
  purchaseViewData.refresh(() {});
  print("SHOWING AHR");
  final result = await FlutterContacts.requestPermission();
  print(result);
  if (result) {
    try {
      print("Getting existing");
      final contacts = await FlutterContacts.getContacts(withProperties: true, withPhoto: false);
      final sortedContacts = contacts.toList();
      contacts.removeWhere((element) => element.emails.isEmpty);
      final contactsCompressed = [];
      // get first name, last name, and email, and that's it. save it in an object like this { first: "..", last: , email}
      for (var element in contacts) {
        contactsCompressed.add({
          "name": element.displayName,
          "email": element.emails.firstWhere((element) => element.isPrimary, orElse: () => element.emails.first).address
        });
      }

      final result = await postRequest("/api/share-all-contacts", {"contacts": contactsCompressed.toList()});
      if (result.error?.isNotEmpty == true) {
        // show error dialog
        showDialog(
          context: router.configuration.navigatorKey.currentContext!,
          builder: (context) => AlertDialog(
            title: const Text("Error"),
            content: Text(result.error!),
            actions: [
              TextButton(
                onPressed: () {
                  router.pop(false);
                },
                child: const Text("Ok"),
              ),
            ],
          ),
        );
      } else {
        // show success dialog
        if (result.result?["creditsRemaining"] != null) {
          globalAuthenticatedUser.creditsRemaining = double.tryParse((result.result?["creditsRemaining"] ?? 0).toString()) ?? 0;
          mainViewState.update();
        }
        showDialog(
          context: router.configuration.navigatorKey.currentContext!,
          builder: (context) => AlertDialog(
            title: const Text("Success"),
            content: const Text("You got free credits!"),
            actions: [
              TextButton(
                onPressed: () {
                  router.pop(false);
                  router.pop();
                },
                child: const Text("Ok"),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      print("error sharing contacts");
      // toast the error
      final toast = SnackBar(content: Text(e.toString()));
      ScaffoldMessenger.of(router.configuration.navigatorKey.currentContext!).showSnackBar(toast);
      print(e);
    } finally {
      purchaseViewData.sharingContacts = false;
      purchaseViewData.refresh(() {});
    }
  } else {
    print("NOT Requesting permission");
    purchaseViewData.sharingContacts = false;
    purchaseViewData.refresh(() {});
    // show dialog stating error getting contacts
    showDialog(
      context: router.configuration.navigatorKey.currentContext!,
      builder: (context) => AlertDialog(
        title: const Text("Error"),
        content: const Text(
            "Error getting contacts.  This is probably because you denied access to contacts.  You can go to settings and enable contacts."),
        actions: [
          TextButton(
            onPressed: () {
              router.pop(false);
            },
            child: const Text("Ok"),
          ),
        ],
      ),
    );
  }
}
