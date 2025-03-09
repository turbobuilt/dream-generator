import '../../../helpers/network_helper.dart';

Future<ActionResult<dynamic>> getMyProfile() async {
  var result = await getRequest("/api/get-my-profile");
  return result;
}