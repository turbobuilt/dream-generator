import 'package:dev/views/upgrade_modal/components/pick_subscription_component/components/subscription_choice_component.dart';
import 'package:dev/views/upgrade_modal/upgrade_modal.dart';
import 'package:dev/views/start_register_modal/components/base_modal_state.dart';
import 'package:dev/views/start_register_modal/start_register_modal.dart';
import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../../../../main.dart';

class PickSubscriptionComponent extends StatelessWidget {
  BaseModalState outOfCreditsModalState;
  var allowAdSupported = false;

  PickSubscriptionComponent(this.outOfCreditsModalState, this.allowAdSupported) {
    globalStore.selectedPlan ??= purchaseViewData.products.firstOrNull?.id;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var product in purchaseViewData.products) ...{
          SubscriptionChoiceComponent(outOfCreditsModalState, product),
          const SizedBox(height: 10),
        },
        if (allowAdSupported) ...{
          SubscriptionChoiceComponent(outOfCreditsModalState, ProductDetails(
            id: "free",
            title: "Ad Supported (lower quality)",
            description: "Support the app by watching ads",
            price: "Free",
            currencyCode: "USD",
            rawPrice: 0,
          )),
        },
      ],
    );
  }
}
