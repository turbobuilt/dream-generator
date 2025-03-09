
import 'package:dev/main.dart';
import 'package:flutter/material.dart';
import '../start_register_modal.dart';

tryShowStartRegisterModal(BuildContext context) async {
  var isFreePlan = globalAuthenticatedUser.plan == "free" || globalAuthenticatedUser.plan == "" || globalAuthenticatedUser.plan == null;
  if (globalAuthenticatedUser.creditsRemaining > 1 || !isFreePlan) {
    return false;
  }
  if (globalAuthenticatedUser.trialDeclined) {
    return false;
  }
  await showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
    barrierColor: Colors.black45,
    transitionBuilder: (BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation, Widget child) {
      return FadeTransition(
        opacity: CurvedAnimation(
          parent: animation,
          curve: Curves.easeOut,
          reverseCurve: Curves.easeIn,
        ),
        child: child,
      );
    },
    transitionDuration: const Duration(milliseconds: 200),
    pageBuilder: (BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation) {
      return StartRegisterModal(const {});
    },
  );
  return true;
}