import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/main_view/components/popup_menu_state.dart';

class NotificationsState extends BetterChangeNotifier {
  List notifications = [];
  int page = 1;
  int perPage = 15;
  String error = "";

  getNotifications() async {
    error = "";
    var result = await callMethod("getNotifications", [{ "page": page, "perPage": perPage }]);
    if (result["error"] != null) {
      error = result["error"];
      notifyListeners();
      return;
    }
    notifications = result["items"];
    popupMenuState.update();
    notifyListeners();
  }

  notificationReceived(notification) {
    notifications.insert(0, notification);
    popupMenuState.update();
    notifyListeners();
  }
}

var notificationsState = NotificationsState();
