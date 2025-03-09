import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/components/popup_menu_choice.dart';
import 'package:dev/views/main_view/components/popup_menu_state.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'popup_menu_click_background.dart';

OverlayEntry? popupMenuOverlay;
closePopupMenu() {
  print("closePopupMenu");
  popupMenuOverlay?.remove();
  popupMenuOverlay = null;
}

showPopupMenu(BuildContext context, double bottom) {
  // use overlay
  OverlayState overlayState = Overlay.of(context);
  popupMenuOverlay = OverlayEntry(
    builder: (context) => Positioned(
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      child: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Expanded(child: PopupMenuClickBackground(onTap: closePopupMenu)),
            PopupMenu(),
          ],
        ),
      ),
    ),
  );
  overlayState.insert(popupMenuOverlay!);
}
class PopupMenu extends SmartWidget<PopupMenuState> {
  PopupMenu() {
    state = popupMenuState;
  }

  @override
  Widget render(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        List<PopupMenuChoice> choices = [];
        for (int i = 3; i < customTabBarState.sortedMenuItems.length; i++) {
          final sortedMenuItem = customTabBarState.sortedMenuItems[i];
          choices.add(PopupMenuChoice(
            menuItem: sortedMenuItem,
            onTap: () {
              closePopupMenu();
              customTabBarState.setTab(sortedMenuItem.value!);
            },
          ));
        }
        return Container(
          color: Colors.white,
          width: constraints.maxWidth,
          padding: const EdgeInsets.all(13),
          child: Wrap(
            spacing: 5,
            direction: Axis.horizontal,
            children: choices,
          ),
        );
      }
    );
  }
}
