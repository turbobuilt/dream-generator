import 'dart:convert';

import 'package:dev/controllers/login_page_controller.dart';
import 'package:dev/views/login_page_view/login_page_view.dart';
import 'package:flutter/material.dart';
import 'package:icons_plus/icons_plus.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../helpers/better_state.dart';

class SignInWithAppleWidget extends StatefulWidget {
  LoginPageViewState parent;
  SignInWithAppleWidget(this.parent);

  @override
  SignInWithAppleWidgetState createState() => SignInWithAppleWidgetState();
}

class SignInWithAppleWidgetState extends BetterState<SignInWithAppleWidget> {
  void appleSignIn() async {
    AuthorizationCredentialAppleID result;
    try {
      result = await SignInWithApple.getAppleIDCredential(
        scopes: [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
      );
    } catch (e) {
      print(e);
      update(() {
        widget.parent.error = e.toString();
        widget.parent.status = '';
      });
      return;
    }

    update(() {
      widget.parent.status = 'Authenticating...';
      widget.parent.error = '';
    });

    final data = await postOauthToken(token: base64Encode(utf8.encode(result.identityToken!)), provider: "apple");
    widget.parent.handleSignIn(result: data);
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: appleSignIn,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
        minimumSize: Size(MediaQuery.of(context).size.width * .8, 40),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      child: const Padding(
        padding: EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LineAwesome.apple, size: 33),
            SizedBox(width: 15),
            Text('Sign in with Apple', style: TextStyle(fontSize: 20)),
          ],
        ),
      ),
    );
  }
}
