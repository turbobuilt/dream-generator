import 'dart:io';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/share_credit_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_android/in_app_purchase_android.dart';
import 'package:in_app_purchase_android/billing_client_wrappers.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../helpers/datastore.dart';
import '../top_bar_view.dart';
import 'components/in_app_purchase_view_state/components/contacts.dart';
import 'components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'components/terms_display_component.dart';

class InAppPurchaseView extends StatelessWidget {
  InAppPurchaseView() {
    // purchaseViewData.getIapObjects();
  }

  @override
  Widget build(BuildContext context) {
    purchaseViewData.context = context;
    var validProducts = purchaseViewData.products
        .where((element) => element.price.trim().isNotEmpty == true && element.price.trim().toLowerCase() != "free" && element.rawPrice != 0)
        .toList();
    return Scaffold(
      body: ChangeNotifierProvider.value(
        value: purchaseViewData,
        child: Consumer<InAppPurchaseViewState>(
          builder: (context, notifier, child) => Container(
            height: MediaQuery.of(context).size.height,
            // background is gainsboro
            color: const Color.fromARGB(255, 233, 233, 233),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // SafeArea(child: SizedBox.shrink()),
                // Container(
                //     // background gradient left to right blue to purple
                //     decoration: const BoxDecoration(
                //       gradient: LinearGradient(
                //         begin: Alignment.topLeft,
                //         end: Alignment.bottomRight,
                //         colors: [Colors.blue, Colors.purple],
                //       ),
                //     ),
                //     child: AppBar(title: const Text(''))),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(15, 0, 15, 0),
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        if (purchaseViewData.error.isNotEmpty) Text(purchaseViewData.error, style: const TextStyle(color: Colors.red, fontSize: 18)),
                        if (purchaseViewData.loadingProducts || purchaseViewData.loadingSubscriptionStatus) ...{
                          const SizedBox(height: 100),
                          const Text("Loading Purchase", style: TextStyle(fontSize: 18)),
                          const SizedBox(height: 90),
                          const Center(child: CircularProgressIndicator()),
                        } else if (purchaseViewData.subscriptionStatusLoaded)
                          Expanded(
                            child: ListView(
                              padding: const EdgeInsets.fromLTRB(0, 15, 0, 1),
                              // shrinkWrap: true,
                              children: [
                                // const Padding(
                                //   padding: EdgeInsets.fromLTRB(0, 0, 0, 15),
                                //   child: Text("If you like a post you get up to 3 free credits per day (for a while)", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                // ),
                                // TextButton(
                                //   onPressed: () => {purchaseViewData.showContactsPage()},
                                //   child: const Text("If you share the app with friends, you can get free credits. Click here to get credits"),
                                // ),
                                const SizedBox(height: 14),
                                const Text("Please upgrade to help me improve the product!"),
                                // const SizedBox(height: 14),
                                // Container(
                                //   // background is white
                                //   padding: const EdgeInsets.fromLTRB(10, 10, 10, 6),
                                //   // border radius 10px, border grey, background gray
                                //   decoration: BoxDecoration(
                                //       borderRadius: BorderRadius.circular(0), border: Border.all(color: Colors.grey), color: Colors.white),
                                //   child: Column(
                                //     crossAxisAlignment: CrossAxisAlignment.start,
                                //     children: [
                                //       if (Platform.isIOS || Platform.isMacOS) ...{
                                //         const Row(
                                //           children: [
                                //             Expanded(
                                //               child: Text("Free - 100 Credits (one time)",
                                //                   style: TextStyle(fontSize: 15, fontWeight: FontWeight.normal)),
                                //             ),
                                //             Text("a month", style: TextStyle(fontSize: 13)),
                                //           ],
                                //         ),
                                //       } else ...{
                                //         const Row(
                                //           mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                //           children: [
                                //             Expanded(
                                //               child: Text("Free - 100 Credits",
                                //                   style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis),
                                //             ),
                                //             Text('One Time', style: TextStyle(fontSize: 13)),
                                //           ],
                                //         ),
                                //       },
                                //       const Row(
                                //         children: [
                                //           ElevatedButton(onPressed: showShareContactsAlert, child: Text("Begin")),
                                //           // const Spacer(),
                                //           // const Text("Share with friends!", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                                //         ],
                                //       ),
                                //     ],
                                //   ),
                                // ),
                                const SizedBox(height: 15),
                                ListView.builder(
                                  // no scroll
                                  physics: const NeverScrollableScrollPhysics(),
                                  shrinkWrap: true,
                                  padding: EdgeInsets.zero,
                                  itemCount: validProducts.length,
                                  itemBuilder: (BuildContext context, int index) {
                                    var product = validProducts[index]; // purchaseViewData.products[index];
                                    var selectedIndex = InAppPurchaseViewState.productIds.indexOf(purchaseViewData.currentPlan ?? "");
                                    var productIndex = InAppPurchaseViewState.productIds.indexOf(product.id);
                                    if (Platform.isAndroid && selectedIndex != -1 && productIndex > selectedIndex) {
                                      return Container();
                                    }
                                    var title = product.title.split("(").firstOrNull?.trim() ?? product.title;
                                    return Padding(
                                      padding: const EdgeInsets.fromLTRB(0, 0, 0, 15),
                                      child: Container(
                                        padding: const EdgeInsets.fromLTRB(10, 10, 10, 6),
                                        // border radius 10px, border grey, background gray
                                        decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(0), border: Border.all(color: Colors.grey), color: Colors.white),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            if (Platform.isIOS || Platform.isMacOS) ...{
                                              Row(
                                                children: [
                                                  Expanded(
                                                    child: Text("${purchaseViewData.planInfoFromServer[product.id]?['credits'] ?? ''} Credits/Month",
                                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.normal)),
                                                  ),
                                                  Text("${product.currencySymbol}${product.rawPrice} a month", style: const TextStyle(fontSize: 13)),
                                                ],
                                              )
                                            } else
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Expanded(
                                                      child: Text(title,
                                                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                                          overflow: TextOverflow.ellipsis)),
                                                  Text(
                                                      "${product.currencySymbol}${product.rawPrice} ${product.id == 'fifty_credits' ? ' six months' : 'a month'}",
                                                      style: const TextStyle(fontSize: 13)),
                                                ],
                                              ),
                                            const SizedBox(height: 5),
                                            Text(
                                                "${purchaseViewData.planInfoFromServer[product.id]?['credits'] ?? ''} Credits/Month. Renews monthly, billed automatically.",
                                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.normal)),
                                            // Text("100 Images/Month", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                            // SizedBox(height: 10),
                                            if (purchaseViewData.processingStatusText != "")
                                              Text(purchaseViewData.processingStatusText,
                                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold))
                                            else if (purchaseViewData.currentPlan == product.id.split(".").lastOrNull)
                                              const Text("Current Plan", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold))
                                            else
                                              ElevatedButton(
                                                onPressed: () => purchaseViewData.startIap(product, index),
                                                child: const Text("Subscribe"),
                                              ),
                                          ],
                                        ),
                                      ),
                                    );
                                    // return ListTile(
                                    //   leading: Text(products[index].title),
                                    //   trailing: Text(products[index].price),
                                    //   subtitle: Text("100 Images/Month"),
                                    //   onTap: () {
                                    //     _iap.buyNonConsumable(purchaseParam: PurchaseParam(productDetails: products[index]));
                                    //     update(() {
                                    //       processingStatusText = "IAP Processing...";
                                    //     });
                                    //   },
                                    // );
                                  },
                                ),
                                // const SizedBox(height: 5),
                                // if (Platform.isAndroid) ...{
                                //   TextButton(
                                //       onPressed: () {
                                //         var url = "https://play.google.com/store/account/subscriptions";
                                //         launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
                                //       },
                                //       child: const Text("Click here to cancel/manage your subscription")),
                                //   const SizedBox(height: 5),
                                // },
                                // const Text("If you want to cancel your subscription, go to the Google Play app, or settings, and you can cancel with Google. This is a Google managed subscription, so you can't cancel in app.")
                                // const Text("There is no free trial for any of these plans. You got some credits at the beginning when you signed up, so that counts as the trial.  If you subscribe, we may occasionally grant a free trial anyway, but it's not likely (this would only happen if we made a mistake). Google Play doesn't get this, so we want you to know that we love you."),
                                // const Text(
                                //     "Free trials expire in couple days, and you unsubscribe at any time. A subscription is not required, and you can continue using it for free with low quality images if you run out of credits.  However a subscription supports the business and helps it grow.  Plus you get much better images if you get credits! (5 times better)."),
                                const SizedBox(height: 5),

                                Row(
                                  children: [
                                    if ((purchaseViewData.currentPlan == null || purchaseViewData.currentPlan == ""))
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () => {
                                            purchaseViewData.restorePurchases(),
                                          },
                                          // gray
                                          style: ElevatedButton.styleFrom(
                                              foregroundColor: const Color.fromARGB(255, 88, 88, 88),
                                              backgroundColor: Colors.white,
                                              // minimumSize: Size(MediaQuery.of(context).size.width * .8, 30),
                                              shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(0), side: const BorderSide(color: Colors.grey)),
                                              padding: const EdgeInsets.fromLTRB(0, 5, 0, 6)),
                                          child: Text(
                                            purchaseViewData.processingStatusText != "" ? purchaseViewData.processingStatusText : "Restore",
                                            style: const TextStyle(),
                                          ),
                                        ),
                                      ),
                                    if (Platform.isAndroid) ...{
                                      if ((purchaseViewData.currentPlan == null || purchaseViewData.currentPlan == "")) const SizedBox(width: 10),
                                      Expanded(
                                        child: ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                              foregroundColor: const Color.fromARGB(255, 88, 88, 88),
                                              backgroundColor: Colors.white,
                                              shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(0), side: const BorderSide(color: Colors.grey)),
                                              padding: const EdgeInsets.fromLTRB(0, 5, 0, 6)),
                                          onPressed: () {
                                            Uri uri = Uri.parse(
                                                "https://play.google.com/store/account/subscriptions?sku=ai.dreamgenerator.app.biggest_plan&package=ai.dreamgenerator.app");
                                            launchUrl(uri, mode: LaunchMode.externalApplication);
                                          },
                                          child: const Text("Cancel or Manage Subscription"),
                                        ),
                                      )
                                    }
                                  ],
                                ),
                              ],
                            ),
                          )
                        else
                          ElevatedButton(
                            onPressed: () {
                              purchaseViewData.getSubscriptionStatus();
                            },
                            child: const Text("Retry"),
                          ),
                      ],
                    ),
                  ),
                ),
                // link to https://dreamgenerator.ai/privacy and https://dreamgenerator.ai/terms
                TermsDisplayComponent(),
                const SizedBox(height: 2),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: ElevatedButton(onPressed: () => router.push("/account"), child: const Text("Account")),
                ),
                const SafeArea(bottom: true, top: false, left: false, right: false, child: SizedBox.shrink())
              ],
            ),
          ),
        ),
      ),
    );
  }
}
