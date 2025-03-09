import 'package:dev/lib/callkit.dart';
import 'package:dev/lib/init_firbase.dart';
import 'package:dev/lib/init_firebase_messaging.dart';
import 'package:dev/lib/server_event_bus.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/views/video_view/video_call.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import '../../helpers/router.dart';
import '../../main.dart';
import '../../vars.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  AppState createState() => AppState();
}

class AppState extends State<App> with WidgetsBindingObserver {
  var listening = false;
  void initListener() {
    if (listening == true) {
      return;
    }
    iapHandler.startListening();
    listening = true;
  }

  @override
  void initState() {
    initListener();
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // initCurrentCall();
    // listenerEvent(onEvent);
  }


  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    print("Changin STATE");
    if (state == AppLifecycleState.resumed) {
      print("RESUMED:::");
      await sseNotifications.connect();
      handleVoipPushIfNeeded();
    } else if (state == AppLifecycleState.paused) {
      sseNotifications.stop();
    }
  }

  @override
  Widget build(BuildContext context) {
    buildContext = context;
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Stack(
        alignment: Alignment.center,
        children: [
          MaterialApp.router(
            routerConfig: router,
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              appBarTheme: const AppBarTheme(
                foregroundColor: Colors.white,
                elevation: 1,
                backgroundColor: Colors.transparent,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryBackground,
                  foregroundColor: primaryForeground,
                  disabledForegroundColor: Colors.grey,
                  textStyle: const TextStyle(fontSize: 15),
                  minimumSize: const Size(88, 36),
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 9),
                  elevation: 2,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(3)),
                    side: BorderSide(color: primaryBorder, width: 2),
                  ),
                ),
              ),
            ),
          ),
          VideoCall(),
        ],
      ),
    );
  }
}
