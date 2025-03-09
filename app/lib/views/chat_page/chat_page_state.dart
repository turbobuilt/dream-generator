import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/lib/smart_widget.dart';

class ChatPageState extends BetterChangeNotifier {
  List<int> authenticatedUsers = [];
  var showingTextChat = false;
  List<Map> chatMessages = [];
  var gettingMessages = false;


  setAuthenticatedUsers(List<int> authenticatedUsers) {
    authenticatedUsers = authenticatedUsers;
    gettingMessages = false;
    chatMessages = [];
    getChatMessages();
  }

  getChatMessages() async {
    if (gettingMessages) {
      return;
    }
    gettingMessages = true;
    update();
    var result = await callMethod("getChatMessages", []);
    gettingMessages = false;
    if (showHttpErrorIfExists(result)) {
      return;
    }
    chatMessages = List<Map>.from(result["items"].map((item) => {"chatMessage": item}).toList());
    print("chat messages $chatMessages");
    update();
  }

  void chatMessageReceived(Map event) { 
    print("message received $event");
    chatMessages.insert(0, event["data"]);
    update();
  }
}

var chatPageState = ChatPageState();