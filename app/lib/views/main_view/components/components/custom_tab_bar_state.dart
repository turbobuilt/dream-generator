import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/components/popup_menu.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomTabBarState extends BetterChangeNotifier {
  MenuItem tab = menuItems[Views.createImageView]!;
  List<MenuItem> sortedMenuItems = [];
  var visibleItemsCount = 4;

  CustomTabBarState() {
    loadSortedMenuItems();
  }

  loadSortedMenuItems() async {
    var sharedPreferences = await SharedPreferences.getInstance();
    if (sharedPreferences.containsKey("menuItemOrder2")) {
      var menuItemOrderRaw = sharedPreferences.getStringList("menuItemOrder2")!;
      menuItemOrder = menuItemOrderRaw.map((e) => int.parse(e)).toList();
      var allIds = menuItems.values.map((e) => e.id).toList();
      menuItemOrder.removeWhere((id) => !allIds.contains(id));
      menuItemOrder.addAll(allIds.where((id) => !menuItemOrder.contains(id)));
    } else {
      menuItemOrder = menuItems.values.map((e) => e.id).toList();
    }
    // make sure 0,1,2 are in front
    menuItemOrder.removeWhere((id) => id < 3);
    menuItemOrder.insertAll(0, [0, 1, 2]);
    await sortMenuItems();
    update();
  }

  Future sortMenuItems() async {
    sortedMenuItems = [];
    for (var id in menuItemOrder) {
      for (var item in menuItems.values) {
        if (item.id == id) {
          sortedMenuItems.add(item);
          break;
        }
      }
    }
    return sortedMenuItems;
  }
  
  // can be Discover, History, Modify, Profile
  setTab(Views tabValue) {
    tab = menuItems[tabValue]!;
    if (tabValue != Views.purchasesView) {
      sortMenuItems();
      closePopupMenu();
    }
    SharedPreferences.getInstance().then((prefs) {
      prefs.setStringList("menuItemOrder2", menuItemOrder.map((e) => e.toString()).toList());
      var hitCount = prefs.getInt("hitCount_${tab.id}") ?? 0;
      prefs.setInt("hitCount_${tab.id}", hitCount + 1);
    });
    sortMenuItems();
    // if selected index is greater than visibleItemsCount - 1 make it visibleItemsCount-1
    if (menuItemOrder.indexOf(tab.id) > visibleItemsCount - 1) {
      // remove it
      menuItemOrder.remove(tab.id);
      sortedMenuItems.remove(tab);
      // add it at index visibleItemsCount - 1
      menuItemOrder.insert(visibleItemsCount - 1, tab.id);
      sortedMenuItems.insert(visibleItemsCount - 1, tab);
    }
    update();
    mainViewState.update();
  }
}

var customTabBarState = CustomTabBarState();
