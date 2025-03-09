import 'package:dev/helpers/network_helper.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:shared_preferences/shared_preferences.dart';
// import ../main
import '../main.dart' show apiOrigin, globalStore, globalAuthenticatedUser;

class OauthSignInInfo {
  String provider;
  String id;
  String email;
  String name;
  String accessToken;
  String idToken;

  OauthSignInInfo({
    required this.provider,
    required this.id,
    required this.email,
    required this.name,
    required this.accessToken,
    required this.idToken,
  });
}

Future<ActionResult> postOauthToken({required String token, required String provider}) async {
  final body = <String, String>{'token': token, 'provider': provider};
  print("posting oauth token");
  final result = await postRequest("/api/oauth-login", body, authenticate: false);
  print("posted oauth token");

  if(result.error != null) {
    return ActionResult({}, result.error);
  }
  return setUserData(result.result["authenticatedUser"], result.result["token"]);
}

Future<ActionResult> createAnonymousAccount() async {
  final prefs = await SharedPreferences.getInstance();
  bool? accountCreated = false;
  try {
    accountCreated = prefs.getBool("accountCreated");
  } catch (err) {
    print("Error getting accountCreated from shared preferences");
    print(err);
  }
  final result = await postRequest("/api/create-anonymous-account", {
    "accountCreated": accountCreated,
  });
  if(result.error != null) {
    return ActionResult({}, result.error);
  }
return setUserData(result.result["authenticatedUser"], result.result["token"]);
}
