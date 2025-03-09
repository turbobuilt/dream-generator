import 'dart:io';

import 'package:dev/controllers/login_page_controller.dart';
import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/login_page_view/login_page_view.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:icons_plus/icons_plus.dart';

class SignInWithGoogleWidget extends StatefulWidget {
  LoginPageViewState parent;
  SignInWithGoogleWidget(this.parent);

  @override
  SignInWithGoogleWidgetState createState() => SignInWithGoogleWidgetState();
}

class SignInWithGoogleWidgetState extends BetterState<SignInWithGoogleWidget> {
  var googleSignIn = (Platform.isIOS || Platform.isMacOS)
      ? GoogleSignIn(clientId: iosClientId, scopes: googleScopes)
      : GoogleSignIn(serverClientId: clientId, scopes: googleScopes);

  Future<void> googleSignInPressed() async {
    // update(() {
      widget.parent.status = 'Authenticating...';
      widget.parent.error = '';
      widget.parent.update();
    // });
    try {
      print("doing google sign in");
      final result = await googleSignIn.signIn();
      print("did google sign in");
      final googleKey = await result!.authentication;
      print("will post oauth token");
      final oauthResult = await postOauthToken(token: googleKey.idToken!, provider: "google");
      widget.parent.handleSignIn(result: oauthResult);
    } catch (e) {
      print("Error doing google sign in");
      print(e);
      update(() {
        widget.parent.error = e.toString();
        widget.parent.status = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: googleSignInPressed,
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
            const Text('Sign in with Google', style: TextStyle(fontSize: 20)),
          ],
        ),
      ),
    );
  }
}
