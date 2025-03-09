import 'package:dev/helpers/network_helper.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:flutter/widgets.dart';

var connectViewState = ConnectViewState();

class ConnectViewState extends BetterChangeNotifier {
  var loading = false;
  List<Map<dynamic, dynamic>> friends = [];

  getFriends(BuildContext context) async {
    loading = true;
    var result = await getRequest("/api/my-friends");
    loading = false;
    update();
    if (result.error?.isNotEmpty == true) {
      if (context.mounted) {
        showAlert("Error", context: context, message: "Error loading friends ${result.error}");
      }
      return;
    }
    friends = result.result["items"];
    update();
  }
}
