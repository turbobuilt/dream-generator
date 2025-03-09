import 'package:dev/helpers/better_state.dart';
import 'package:dev/main.dart';
import 'package:dev/views/in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

var isFirstLoad = true;
checkIfIsFirstLoad() async {
  if (isFirstLoad) {
    var preferences = await SharedPreferences.getInstance();
    isFirstLoad = preferences.getBool("isFirstLoad") ?? true;
    if (isFirstLoad) {
      preferences.setBool("isFirstLoad", false);
    }
  }
  return isFirstLoad;
}

showStartTrialDialog(BuildContext context) async {
  await checkIfIsFirstLoad();
  if (context.mounted && (isFirstLoad || globalAuthenticatedUser.creditsRemaining < 1)) {
    await showDialog(
      context: mainViewState.context,
      builder: (BuildContext context) {
        return StartTrialDialog();
      },
    );
    return true;
  }
  return false;
}

class StartTrialDialog extends StatefulWidget {
  @override
  StartTrialDialogState createState() => StartTrialDialogState();
}

class StartTrialDialogState extends BetterState<StartTrialDialog> {
  StartTrialDialogState() {
    start();
  }

  start() async {
    if (purchaseViewData.products.isEmpty) {
      await purchaseViewData.getIapObjects();
    }
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
                const Text(
                    'In order to ensure better service, we need to make sure that users are willing to subscribe if they like the product. Please upgrade to a 2 day free trial to test out the chat services.  You can downgrade in the settings app any time before the trial expires. If you forget, you can bug Apple about a refund, but you probably shouldn\'t!'),
                const SizedBox(height: 20),
                if (purchaseViewData.error.isNotEmpty) Text(purchaseViewData.error, style: const TextStyle(color: Colors.red)),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
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
