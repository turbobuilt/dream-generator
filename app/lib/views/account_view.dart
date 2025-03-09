import 'package:dev/helpers/router.dart';
import 'package:dev/lib/native_messaging.dart';
import 'package:dev/lib/server_event_bus.dart';
import 'package:dev/main.dart';
import 'package:dev/models/AuthenticatedUser.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

final accountView = AccountViewState();

class AccountViewState extends ChangeNotifier {
  startLogout() async {
    final confirm = await showDialog(
      context: router.configuration.navigatorKey.currentContext!,
      builder: (context) => AlertDialog(
        title: const Text("Are you sure you want to logout?"),
        content: ChangeNotifierProvider.value(
          value: accountView,
          child: Consumer<AccountViewState>(
            builder: (context, notifier, child) => const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                    "Logging out doesn't delete files yet! Thanks for using the app.  If you didn't make an account, this will delete any few credits that were freely given.  Paid credits can be restored by click the 'restore purchase'.  If you signed in with Google or Apple, this isn't an issue.  Thanks for trying out the app, hope to have you back soon!")
                // if (error.isNotEmpty) Text(error),
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
              logout();
            },
            child: const Text("Logout"),
          ),
        ],
      ),
    );
  }

  logout() async {
    // save to session storage "hasCreatedAccount=true"
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.clear();
    prefs.setBool("accountCreated", true);
    globalAuthenticatedUser.clear();
    feedView.reset();
    mainViewState.update();
    MessageChannel.channel.invokeMethod('setUserToken', globalStore.userToken);
    // sseNotifications.token = null;
    // sseNotifications.stop();
    while(router.canPop()) {
      router.pop();
    }
    router.replace("/login");
  }
}

class AccountView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ChangeNotifierProvider.value(
        value: accountView,
        child: Consumer<AccountViewState>(
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
                  child: AppBar(title: const Text('Account'))),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 20),
                  ElevatedButton(
                      onPressed: () => {router.push("/advanced-account")},
                      style: ButtonStyle(
                        // 80% width
                        minimumSize: MaterialStateProperty.all(Size(MediaQuery.of(context).size.width * .8, 20)),
                      ),
                      child: const Text("Advanced Options")),
                  const SizedBox(height: 20),
                  ElevatedButton(
                      onPressed: accountView.startLogout,
                      style: ButtonStyle(
                        // 80% width
                        minimumSize: MaterialStateProperty.all(Size(MediaQuery.of(context).size.width * .8, 20)),
                      ),
                      child: const Text("Logout")),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
