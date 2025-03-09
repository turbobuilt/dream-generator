import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'package:dev/views/upgrade_modal/components/better_chat_promo.dart';
import 'package:dev/views/upgrade_modal/components/features_component/feature_component.dart';
import 'package:dev/views/upgrade_modal/components/features_component/features_component.dart';
import 'package:dev/views/upgrade_modal/components/no_subscription_notice_modal.dart';
import 'package:dev/views/upgrade_modal/components/pick_subscription_component/pick_subscription_component.dart';
import 'package:dev/views/upgrade_modal/components/quality_notice.dart';
import 'package:dev/views/upgrade_modal/components/see_difference_view.dart';
import 'package:dev/views/start_register_modal/components/base_modal_state.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

tryShowOutOfCreditsModalIfNotSeen(BuildContext context, bool showFreeTier) async {
  if (globalAuthenticatedUser.plan == null || globalAuthenticatedUser.plan == "free" || globalAuthenticatedUser.plan == "") {
    var sharedPreferences = await SharedPreferences.getInstance();

    // remove this!
    // await sharedPreferences.setBool("hasSeenOutOfCreditsModal", false);

    var hasSeenOutOfCreditsModal = sharedPreferences.getBool("hasSeenOutOfCreditsModal") ?? false;
    if (!hasSeenOutOfCreditsModal && context.mounted) {
      sharedPreferences.setBool("hasSeenOutOfCreditsModal", true);
      return await tryShowOutOfCreditsModal(context, showFreeTier);
    }
  }
  return false;
}

tryShowOutOfCreditsModal(BuildContext context, bool showFreeTier, {force = false}) async {
  if (globalAuthenticatedUser.creditsRemaining > .1 && !force) {
    return false;
  }
  await showCupertinoModalBottomSheet(
    context: context,
    expand: false,
    isDismissible: false || !showFreeTier,
    builder: (context) => OutOfCreditsModal(showFreeTier: showFreeTier),
  );
  return true;
}

class OutOfCreditsModal extends StatefulWidget {
  final bool showFreeTier;
  const OutOfCreditsModal({this.showFreeTier = false});

  @override
  OutOfCreditsModalState createState() => OutOfCreditsModalState();
}

class OutOfCreditsModalState extends BaseModalState<OutOfCreditsModal> {
  OutOfCreditsModalState() {
    start();
  }

  start() async {
    await purchaseViewData.getIapObjects();
  }

  startPurchase() async {
    if (globalStore.selectedPlan == null || globalStore.selectedPlan == "free") {
      noSubscribePressed();
      return;
    }
    var plan = purchaseViewData.products.firstWhere((element) => element.id == globalStore.selectedPlan);
    var index = purchaseViewData.products.indexOf(plan);
    await purchaseViewData.startIap(plan, index);
  }

  noSubscribePressed() async {
    var willUpgrade = await showNoSubscriptionNoticeModal(context);
    if (context.mounted && willUpgrade == false) {
      await showLowQualityImagesModal(context);
      router.pop(willUpgrade);
    }
  }

  close() {
    router.pop(false);
  }

  getButtonMainButtonText() {
    if (purchaseViewData.processingStatusText.isNotEmpty) {
      return purchaseViewData.processingStatusText;
    }
    if (globalStore.selectedPlan == null || globalStore.selectedPlan == "free") {
      return "Ad Supported";
    }
    return "Start Subscription";
  }

  @override
  Widget build(BuildContext context) {
    var hasProducts = purchaseViewData.products.isNotEmpty;
    const defaultTextStyle = TextStyle(color: Colors.black, fontWeight: FontWeight.normal);
    return Material(
      child: ChangeNotifierProvider.value(
        value: purchaseViewData,
        child: DefaultTextStyle(
          style: defaultTextStyle,
          child: Consumer<InAppPurchaseViewState>(
            builder: (context, notifier, child) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  child: const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(height: 4),
                      Text("Help us Grow!", textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      SizedBox(height: 14),
                      Text("My name is Hans and I need help."),
                      SizedBox(height: 14),
                      Text("Plus, by upgrading, you get these benefits:"),
                      SizedBox(height: 10),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: SeeDifferenceView(),
                      ),
                      BetterChatPromo(),
                      const SizedBox(height: 10),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FeatureComponent("Stay up to date with the latest AI models"),
                      FeatureComponent("Works online at DreamGenerator.ai"),
                      FeatureComponent("No Ads"),
                    ],
                  ),
                ),
                Container(
                  color: Colors.blue,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: const Center(
                    child: Text(
                      "Upgrade Now",
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(10, 5, 10, 10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // FeatureComponent("Use the latest AI chat models for best results (more knowledge, better logic)"),

                      const SizedBox(height: 4),
                      // UpgradeEquityNotice(),
                      PickSubscriptionComponent(this, widget.showFreeTier),
                      if (purchaseViewData.error.isNotEmpty) Text(purchaseViewData.error, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 0),
                      if (!widget.showFreeTier)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            GestureDetector(
                              onTap: () {
                                globalStore.selectedPlan = null;
                                startPurchase();
                              },
                              child: const Text("Free Plan (Lower Quality)", textAlign: TextAlign.end, style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        )
                      else
                        const SizedBox(height: 4),
                      const SizedBox(height: 18),
                      if (hasProducts) ...{
                        ElevatedButton(
                          clipBehavior: Clip.hardEdge,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            padding: const EdgeInsets.all(0),
                            elevation: 3,
                            minimumSize: const Size(0, 0),
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                          ),
                          onPressed: () {
                            startPurchase();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),

                            // bakcgorun d purple to blue left to right
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [Colors.purple, Colors.blue],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                            ),
                            child: Text(
                              getButtonMainButtonText(),
                              style: const TextStyle(fontSize: 17, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      },
                      const SizedBox(height: 50),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
