import 'package:firebase_analytics/firebase_analytics.dart';

import '../controllers/login_page_controller.dart';
import '../main.dart';
import 'network_helper.dart';

class Result {
  var error = "";
  var success = false;

  Result({this.error = "", this.success = false});
}

Future<Result> googleSignInPressed() async {
  try {
    print("doing google sign in");
    final result = await googleSignIn.signIn();
    print("did google sign in");
    final googleKey = await result!.authentication;
    print("will post oauth token");
    final oauthResult = await postOauthToken(token: googleKey.idToken!, provider: "google");
    handleSignInAnalytics(result: oauthResult);
    print(oauthResult);
    return Result(success: true);
  } catch (e) {
    print("Error doing google sign in");
    print(e);
    return Result(error: e.toString(), success: false);
  }
}

void handleSignInAnalytics({required ActionResult result}) {
  if (result.result["newUser"] == true) {
    FirebaseAnalytics.instance.logEvent(name: 'sign_up', parameters: {
      'email': result.result["authenticatedUser"]["email"],
    });
  } else if (result.result["newUser"] == false) {
    FirebaseAnalytics.instance.logLogin(loginMethod: 'oauth');
  }
}
