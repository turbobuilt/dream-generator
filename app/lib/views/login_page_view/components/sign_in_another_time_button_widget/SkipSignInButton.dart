import 'package:dev/helpers/router.dart';
import 'package:dev/views/login_page_view/login_page_view.dart';
import 'package:flutter/material.dart';

class SkipSignInButton extends StatelessWidget {
  LoginPageViewState parent;
  SkipSignInButton(this.parent);

  void bypassSignIn() async {
    if (parent.status != '') {
      return;
    }
    router.pushNamed("start_register_modal", extra: { "parent": parent });
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: bypassSignIn,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.all(0),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
        minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
        backgroundColor: Colors.transparent,
        foregroundColor: const Color.fromARGB(255, 202, 202, 202),
      ),
      child: Container(
        padding: const EdgeInsets.all(8.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(7),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Skip Sign In', style: TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
