import 'package:dev/lib/smart_widget.dart';
import 'package:dev/vars.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/components/popup_menu.dart';
import 'package:dev/views/modify_image_view.dart';
import 'package:dev/views/my_likes.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CustomTabBar extends SmartWidget {
  GlobalKey tabBarKey = GlobalKey();
  CustomTabBar() {
    state = customTabBarState;
  }

  getHeight() {
    return (tabBarKey.currentContext?.findRenderObject() as RenderBox?)?.size.height ?? 84;
  }

  @override
  Widget render(BuildContext context) {
    if (customTabBarState.sortedMenuItems.isEmpty) {
      return const SizedBox(height: 84);
    }
    return ListView(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        if (customTabBarState.tab == menuItems[Views.feedView]!)
          const SizedBox(height: 0)
        else if (customTabBarState.tab == menuItems[Views.createImageView]!)
          CreateImageView(true, createImageViewHistory)
        else if (customTabBarState.tab == menuItems[Views.editImageView]!)
          EditImageView()
        else if (customTabBarState.tab == menuItems[Views.myLikesView]!)
          MyLikesView(),
        SafeArea(
          bottom: true,
          left: true,
          right: true,
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(0, 9, 0, 0),
            child: Row(
              children: [
                for (var tab in customTabBarState.sortedMenuItems.sublist(0, customTabBarState.visibleItemsCount))
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        customTabBarState.setTab(tab.value!);
                      },
                      child: Column(
                        children: [
                          Icon(tab.icon, color: tab == customTabBarState.tab ? Colors.blue : primaryBackground),
                          Text(tab.label, style: TextStyle(color: tab == customTabBarState.tab ? Colors.blue : primaryBackground)),
                        ],
                      ),
                    ),
                  ),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      showPopupMenu(context, getHeight());
                    },
                    child: const Column(
                      children: [
                        Icon(Icons.more_horiz),
                        Text("More"),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        )
      ],
    );
  }
}