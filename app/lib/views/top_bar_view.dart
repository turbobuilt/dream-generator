import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/in_app_purchase_view/in_app_purchase_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'main_view/components/main_tab_bar.dart';

class TopBarViewData extends ChangeNotifier {
  bool showInAppPurchase = false;

  void toggleInAppPurchase() {
    showInAppPurchase = !showInAppPurchase;
    notifyListeners();
  }

  void update() {
    notifyListeners();
  }
}

TopBarViewData globalTopBarViewData = TopBarViewData();

class TopBarView extends StatelessWidget {
  final TopBarViewData store = globalTopBarViewData;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: globalTopBarViewData,
      child: Consumer<TopBarViewData>(
        builder: (context, tapOutsideOverlayState, child) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
            decoration: const BoxDecoration(
                gradient: LinearGradient(
              colors: [Colors.blue, Colors.purple],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            )),
            child: SafeArea(
              top: true,
              bottom: false,
              left: false,
              right: false,
              child: Container(),
            ),
          );
        },
      ),
    );
  }
}
