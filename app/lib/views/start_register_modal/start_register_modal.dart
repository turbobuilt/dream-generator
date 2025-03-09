import 'package:dev/main.dart';
import 'package:dev/views/in_app_purchase_view/components/terms_display_component.dart';
import 'package:dev/views/upgrade_modal/components/features_component/features_component.dart';
import 'package:dev/views/upgrade_modal/components/pick_subscription_component/pick_subscription_component.dart';
import 'package:dev/views/start_register_modal/components/base_modal_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'components/show_restore_purchases_pressed_modal.dart';
import 'components/start_register_modal_layout_container/components/start_register_modal_app_bar.dart';
import 'components/start_register_modal_layout_container/start_register_modal_layout_container.dart';
import 'components/try_show_trial_required_notice.dart';

class StartRegisterModal extends StatefulWidget {
  final Object? extra;
  const StartRegisterModal(this.extra);

  @override
  StartRegisterModalState createState() => StartRegisterModalState();
}

class StartRegisterModalState extends BaseModalState<StartRegisterModal> {
  StartRegisterModalState() {
    start();
  }

  start() async {
    await purchaseViewData.getIapObjects();
  }

  startPurchase() async {
    var plan = purchaseViewData.products.firstWhere((element) => element.id == globalStore.selectedPlan);
    var index = purchaseViewData.products.indexOf(plan);
    if (index == -1) {
      return;
    }
    await purchaseViewData.startIap(plan, index);
  }

  @override
  void initState() {
    super.initState();
    tryShowTrialRequiredNotice(context);
  }

  @override
  Widget build(BuildContext context) {
    var showTrialMessage = (globalAuthenticatedUser.plan == null || globalAuthenticatedUser.plan == "free" || globalAuthenticatedUser.plan == "") &&
        globalAuthenticatedUser.trialUsed != true;
    const defaultTextStyle = TextStyle(color: Colors.white, fontWeight: FontWeight.normal);
    var title = "Welcome to Dream Generator!";
    return ChangeNotifierProvider.value(
      value: purchaseViewData,
      child: Consumer<InAppPurchaseViewState>(
        builder: (context, notifier, child) => StartRegisterModalLayoutContainer(
          defaultTextStyle: defaultTextStyle,
          child: Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              StartRegisterModalAppBar(),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(9.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      const SizedBox(height: 5),
                      Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      FeaturesComponent(),
                      const SizedBox(height: 20),
                      if (purchaseViewData.products.isNotEmpty) ...{
                        PickSubscriptionComponent(this, false),
                        if (purchaseViewData.error.isNotEmpty) ...{
                          const SizedBox(height: 4),
                          SizedBox(
                            height: 100,
                            child: ListView(
                              padding: EdgeInsets.zero,
                              children: [
                                Text(purchaseViewData.error, style: const TextStyle(color: Colors.red)),
                              ],
                            ),
                          )
                        },
                        const SizedBox(height: 4),
                        const SizedBox(height: 20),
                        if (purchaseViewData.products.isNotEmpty) ...{
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              elevation: 0,
                              minimumSize: const Size(0, 0),
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            onPressed: startPurchase,
                            child: Text(purchaseViewData.processingStatusText.isNotEmpty ? purchaseViewData.processingStatusText : "Activate!",
                                style: const TextStyle(fontSize: 17, color: Colors.white, fontWeight: FontWeight.normal)),
                          ),
                          const SizedBox(height: 20),
                          TextButton(
                            onPressed: () => showRestorePurchasesPressedModal(context),
                            style: TextButton.styleFrom(
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            // text shadow
                            child: const Text("Restore Subscription"),
                          ),
                        }
                      } else ...{
                        const SizedBox(height: 30),
                        const Text("Loading..."),
                      },
                      if (purchaseViewData.error.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text(purchaseViewData.error, style: const TextStyle(color: Colors.red)),
                        ),
                      // const SizedBox(height: 150),
                      Expanded(child: Container()),
                      TermsDisplayComponent(),
                      const Text(
                        'Credit usage data is subject to change without notice as models get upgraded or hardware improves. Our suppliers may change prices, and it ususally means it will be cheaper, but it could, in a rare circumstance, become more expensive.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
