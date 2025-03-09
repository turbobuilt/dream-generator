import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/edit_user_public_profile/edit_user_public_profile.dart';
import 'package:dev/views/edit_user_public_profile/helpers/get_my_profile.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../main.dart';
import '../../create_image_view/components/create_image_view_data/create_image_view_data.dart';
import '../../create_image_view/create_image_view.dart';
import '../../modify_image_view.dart';
import '../../my_likes.dart';
import '../main_view.dart';
import 'popup_menu.dart';

var tabBarState = MainMenuState();

// custom tab bar class
class MainMenu extends StatefulWidget {
  @override
  // ignore: no_logic_in_create_state
  State<StatefulWidget> createState() {
    if (deepLink != null) {
      // handle link after 1 second
      Future.delayed(const Duration(seconds: 1), () {
        handleDeepLink(deepLink!);
      });
    }
    tabBarState = MainMenuState();
    return tabBarState;
  }
}

enum Views {
  feedView,
  createImageView,
  aiChatView,
  editImageView,
  myLikesView,
  promptCategoriesView,
  purchasesView,
  myProfileView,
  upscaleView,
  removeBackgroundView,
  peopleView,
  notificationsView,
  generateAudio,
  animateVideoView,
}

class MenuItem {
  int id;
  IconData icon;
  String label;
  Views? value;
  MenuItem({required this.icon, required this.label, required this.value, required this.id});
}

final menuItems = {
  Views.createImageView: MenuItem(icon: Icons.image, label: "Paint", value: Views.createImageView, id: 0),
  Views.aiChatView: MenuItem(icon: Icons.chat, label: "Ask AI", value: Views.aiChatView, id: 1),
  Views.feedView: MenuItem(icon: Icons.explore_outlined, label: "Trends", value: Views.feedView, id: 2),
  Views.upscaleView: MenuItem(icon: Icons.zoom_in, label: "Upscale", value: Views.upscaleView, id: 7),
  Views.removeBackgroundView: MenuItem(icon: Icons.portrait_outlined, label: "EraseBG", value: Views.removeBackgroundView, id: 8),
  Views.editImageView: MenuItem(icon: Icons.palette, label: "Modify", value: Views.editImageView, id: 3),
  Views.myLikesView: MenuItem(icon: Icons.cloud_outlined, label: "Published", value: Views.myLikesView, id: 4),
  Views.myProfileView: MenuItem(icon: Icons.person, label: "Profile", value: Views.myProfileView, id: 6),
  Views.purchasesView: MenuItem(icon: Icons.check, label: "Account", value: Views.purchasesView, id: 5),
  Views.peopleView: MenuItem(icon: Icons.people, label: "People", value: Views.peopleView, id: 9),
  Views.notificationsView: MenuItem(icon: Icons.notifications, label: "New", value: Views.notificationsView, id: 10),
  Views.generateAudio: MenuItem(icon: Icons.mic, label: "AudioX", value: Views.generateAudio, id: 11),
};
List<int> menuItemOrder = [];

var createImageViewHistory = CreateImageViewData(theme: ViewTheme.light);


class MainMenuState extends BetterState<MainMenu> with TickerProviderStateMixin {
  MenuItem tab = menuItems[Views.createImageView]!;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    if (customTabBarState.sortedMenuItems.isEmpty) {
      return const SizedBox(height: 84);
    }
    return ListView(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        if (tab == menuItems[Views.feedView]!)
          const SizedBox(height: 0)
        else if (tab == menuItems[Views.createImageView]!)
          CreateImageView(true, createImageViewHistory)
        else if (tab == menuItems[Views.editImageView]!)
          EditImageView()
        else if (tab == menuItems[Views.myLikesView]!)
          MyLikesView(),
        // CustomTabBar(tabs: tabs)
      ],
    );
  }
}
