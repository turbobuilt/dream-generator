import 'package:dev/helpers/better_state.dart';
import 'package:dev/main.dart';
import 'package:dev/views/in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:provider/provider.dart';

import 'components/get_plans.dart';

showChatUpgradeDialog(BuildContext context) {
  showDialog(
    context: mainViewState.context,
    builder: (BuildContext context) {
      return ChatUpgradeDialog();
    },
  );
}

class ChatUpgradeDialog extends StatefulWidget {
  @override
  ChatUpgradeDialogState createState() => ChatUpgradeDialogState();
}

class ChatUpgradeDialogState extends BetterState<ChatUpgradeDialog> {
  // var productIds = ["ai.dreamgenerator.app.complete"];
  // var purchasing = false;

  ChatUpgradeDialogState() {
    start();
  }

  start() async {
    await purchaseViewData.getIapObjects();
  }

  startPurchasing(ProductDetails product, index) {
    purchaseViewData.startIap(product, index);
  }

  @override
  Widget build(BuildContext context) {
    var hasProducts = purchaseViewData.products.isNotEmpty;

    return ChangeNotifierProvider.value(
      value: purchaseViewData,
      child: Consumer<InAppPurchaseViewState>(
        builder: (context, notifier, child) => AlertDialog(
          title: const Text('Help Us Grow!'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (globalAuthenticatedUser.trialDeclined)
                  const Text(
                      "At this time there is no free tier for chat. Hopefully we come up with something. In the mean time, please consider subscribing to help us out! You are amazing.")
                else
                  const Text(
                      'In order to ensure better service, we need to make sure that users are willing to subscribe if they like the product. Please upgrade to a 2 day free trial to test out the chat services.  You can downgrade in the settings app any time before the trial expires. If you forget, you can bug Apple about a refund, but you probably shouldn\'t!'),
                const SizedBox(height: 20),
                if (purchaseViewData.error.isNotEmpty) Text(purchaseViewData.error, style: const TextStyle(color: Colors.red)),
              ],
            ),
          ),
          actions: [
            if (!purchaseViewData.purchasing)
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: const Text('Cancel'),
              ),
            // const Spacer(),
            ElevatedButton(
              onPressed: () {
                if (purchaseViewData.loadingProducts || purchaseViewData.products.isEmpty) {
                  return;
                }
                startPurchasing(purchaseViewData.products.first, 0);
              },
              child: purchaseViewData.loadingProducts
                  ? const CircularProgressIndicator()
                  : purchaseViewData.processingStatusText.isNotEmpty
                      ? Text(purchaseViewData.processingStatusText)
                      : Text('Start Trial ${purchaseViewData.products.first.price}/month'),
            ),
          ],
        ),
      ),
    );
  }
}
