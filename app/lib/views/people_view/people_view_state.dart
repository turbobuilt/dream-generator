import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:flutter/material.dart';

class PeopleViewState extends BetterChangeNotifier {
  // text editing contorller
  var peopleSearchTextController = TextEditingController();
  var page = 1;
  var perPage = 15;
  var searchingPeople = true;
  List<Map> peopleResults = [];

  PeopleViewState() {
    peopleSearchTextController.addListener(() { 
      page = 1;
      perPage = 15;
      print(peopleSearchTextController.text);
    });
  }

  searchPeople() async {
    if(peopleSearchTextController.text.isEmpty) {
      return;
    }
    print("searching people");
    searchingPeople = true;
    notifyListeners();
    var result = await callMethod("postSearchPeople", [peopleSearchTextController.text, {
      "page": page,
      "perPage": perPage
    }]);
    if (showHttpErrorIfExists(result)) {
      notifyListeners();
      return;
    }
    searchingPeople = false;
    peopleResults = List<Map>.from(result["items"]);
    notifyListeners();
  }
}

var peopleViewState = PeopleViewState();