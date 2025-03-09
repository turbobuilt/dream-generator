import 'dart:convert';
import 'dart:io';
import 'package:dev/controllers/login_page_controller.dart';
import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/login_page_view/components/sign_in_another_time_button_widget/SkipSignInButton.dart';
import 'package:dev/views/login_page_view/components/SignInWithAppleWidget.dart';
import 'package:dev/views/login_page_view/components/SignInWithGoogleWidget.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/start_register_modal/components/background_slideshow_widget.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:icons_plus/icons_plus.dart';

import '../../helpers/login.dart';

class LoginPageView extends StatefulWidget {
  @override
  LoginPageViewState createState() => LoginPageViewState();
}

var iosClientId = "790316791498-821vknncnv4b5r7v7ds31ovep8borcap.apps.googleusercontent.com";
String? androidClientId = "790316791498-utie09qvamofv7put3tfbgltjnkghrjk.apps.googleusercontent.com";

final googleScopes = ['email', 'profile'];
var clientId = (Platform.isIOS || Platform.isMacOS) ? iosClientId : androidClientId;

class LoginPageViewState extends BetterState<LoginPageView> {
  final gradient = const LinearGradient(colors: [Colors.blue, Colors.purple]);
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String status = '';
  String error = '';

  void handleSignIn({required ActionResult result}) {
    handleSignInAnalytics(result: result);
    purchaseViewData.getSubscriptionStatus();
    if (result.error != null) {
      print(result.error);
      update(() {
        error = result.error!;
        status = '';
      });
    } else {
      print("successful login!");
      update(() {
        status = '';
      });
      if (globalAuthenticatedUser.agreesToTerms) {
        router.replace("/home");
      } else {
        router.replace("/home");
      }
    }
  }

  var backgroundImagePaths = [
    "assets/images/171.avif",
    // "assets/images/girl.avif",
    "assets/images/179.avif",
    "assets/images/galaxy_big.avif",
    "assets/images/lion.avif",
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      body: Stack(
        children: [
          BackgroundSlideshowWidget(imagePaths: backgroundImagePaths),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                const SafeArea(top: true, bottom: false, child: SizedBox.shrink()),
                SkipSignInButton(this),
                const Text('Login highly recommended!',
                    textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: Color.fromARGB(255, 202, 202, 202))),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 50),
                      const Text('DreamGenerator.ai', style: TextStyle(fontSize: 25, color: Colors.white)),
                      const SizedBox(height: 30),
                      if (Platform.isIOS || Platform.isMacOS) ...{
                        SignInWithAppleWidget(this),
                        const SizedBox(height: 20),
                      },
                      SignInWithGoogleWidget(this),
                      const SizedBox(height: 25),
                      Text(
                        status,
                        style: const TextStyle(fontSize: 18, color: Colors.white),
                      ),
                      const SizedBox(height: 70)
                    ],
                  ),
                ),
                if (error != '')
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      error,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                  )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
