import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class StartRegisterModalAppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CupertinoNavigationBar(
      padding: const EdgeInsetsDirectional.only(start: 0, end: 0),
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      leading: CupertinoNavigationBarBackButton(
        onPressed: () {
          Navigator.of(context).pop();
        },
        previousPageTitle: "Login/Signup",
      ),
    );
  }
}