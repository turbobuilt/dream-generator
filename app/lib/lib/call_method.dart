import 'dart:convert';
import 'package:dev/main.dart';
import 'package:http/http.dart' as http;

Future<dynamic> callMethod(String name, List<dynamic> args) async {
  try {
    // Check if starts with get/post/put/delete
    String method = RegExp(r'^(get|post|put|delete)[A-Z]').firstMatch(name)?.group(1) ?? 'post';
    String queryString = "?methodName=$name";

    if (method == 'get') {
      for (var i = 0; i < args.length; i++) {
        queryString += "${i == 0 ? '&' : '&'}${args[i]['key']}=${args[i]['value']}";
      }
    }

    final response = await http.post(
      Uri.parse('$apiOrigin/api/method-call$queryString'),
      headers: {
        'Content-Type': 'application/json',
        'authorizationtoken': globalStore.userToken,
      },
      body: jsonEncode({'methodName': name, 'args': args}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return {'error': 'Failed to call method: ${response.reasonPhrase} ${response.body}'};
    }
  } catch (err, stack) {
    print ("Error calling method $name");
    print (err);
    print (stack);
    return {'error': "$err"};
  }
}