import 'dart:io';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/models/AuthenticatedUser.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

final advancedAccountViewData = AdvancedAccountViewState();

class AdvancedAccountViewState extends ChangeNotifier {
  var error = "";

  void deleteAccount() async {
    // first confirm
    // then delete

    // confirm dialog:
    final confirm = await showDialog(
      context: router.configuration.navigatorKey.currentContext!,
      builder: (context) => AlertDialog(
        title: const Text("Are you sure you want to delete your account?"),
        content: ChangeNotifierProvider.value(
          value: advancedAccountViewData,
          child: Consumer<AdvancedAccountViewState>(
            builder: (context, notifier, child) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("This action cannot be undone."),
                const SizedBox(height: 20),
                if (error.isNotEmpty) Text(error),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              router.pop(false);
            },
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () async {
              print("deleting account");
              final result = await getRequest("/api/delete-account");
              if (result.error == null) {
                globalAuthenticatedUser = AuthenticatedUser();
                // set all preferences to null
                globalStore.userToken = "";
                SharedPreferences prefs = await SharedPreferences.getInstance();
                prefs.clear();
                prefs.setBool("accountCreated", true);

                // delete all items in documents recursively
                final dir = await getApplicationDocumentsDirectory();
                // list items
                final lister = dir.list(recursive: false);
                await for (var file in lister) {
                  print("deleting file ${file.path}");
                  // if it's a directory delete recursively, otherwise delete
                  try {
                    if (file is Directory) {
                      await file.delete(recursive: true);
                    } else {
                      await file.delete();
                    }
                  } catch (e) {
                    print("error deleting file");
                    print(e);
                  }
                }

                while (router.canPop()) {
                  router.pop();
                }
                router.replace("/login");
              } else {
                print("error deleting account");
                print(result.error);
                error = result.error!;
                notifyListeners();
              }
            },
            child: const Text("Delete"),
          ),
        ],
      ),
    );
  }
}

class AdvancedAccountView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ChangeNotifierProvider.value(
        value: advancedAccountViewData,
        child: Consumer<AdvancedAccountViewState>(
          builder: (context, notifier, child) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                  // background gradient left to right blue to purple
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.blue, Colors.purple],
                    ),
                  ),
                  child: AppBar(title: const Text('Advanced Account'))),
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // delete account button
                    ElevatedButton(
                      onPressed: () {
                        advancedAccountViewData.deleteAccount();
                      },
                      child: const Text("Delete Account"),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
