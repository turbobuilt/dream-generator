import 'package:dev/main.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:flutter/material.dart';

class CreditsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 10, right: 10, bottom: 8),
      // background gradient left to right blue to purple
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.blue, Colors.purple],
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          const Text(""),
          GestureDetector(
            onTap: () => {
              purchaseViewData.start(),
              customTabBarState.setTab(Views.purchasesView),
            },
            child: globalAuthenticatedUser.plan == "complete"
                ? const Text("Account Details")
                : Text('${globalAuthenticatedUser.creditsRemaining.toStringAsFixed(1)} Credits',
                    style: const TextStyle(color: Colors.white, fontSize: 15)),
          ),
        ],
      ),
    );
  }
}
