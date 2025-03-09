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
import 'package:in_app_purchase_storekit/in_app_purchase_storekit.dart';
import 'package:in_app_purchase_storekit/store_kit_wrappers.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../helpers/datastore.dart';

class InAppPurchaseViewState extends ChangeNotifier {
  final InAppPurchase iap = InAppPurchase.instance;
  bool loadingProducts = false;
  String error = '';
  String processingStatusText = '';
  String successText = '';
  late BuildContext context;
  List<ProductDetails> products = [];
  var sharingContacts = false;

  static var productIds = Platform.isIOS
      ? ["ai.dreamgenerator.app.biggest_plan","ai.dreamgenerator.app.normal_plan"]
      // : ["ai.dreamgenerator.app.biggest_plan", "ai.dreamgenerator.app.big_plan", "ai.dreamgenerator.app.normal_plan"];
      : ["ai.dreamgenerator.app.bigger_plan"];
  var defaultPlanId = Platform.isIOS ? "ai.dreamgenerator.app.big_plan" : "ai.dreamgenerator.app.normal_plan";
  var singlePurchaseIds = ["fifty_credits"];

  String? currentPlan;
  String? token;
  Map<String, dynamic> planInfoFromServer = {};
  bool loadingSubscriptionStatus = false;
  bool subscriptionStatusLoaded = false;
  bool purchasing = false;

  InAppPurchaseViewState() {
    print("starting state");
    start();
  }

  Future start({bool force = false, loadSubscriptionStatus = true}) async {
    print("Doing start");
    if (force || (!loadingProducts && !loadingSubscriptionStatus && products.isEmpty)) {
      error = "";
      processingStatusText = "";
      successText = "";
      loadingProducts = true;
      await getIapObjects();
      if (loadSubscriptionStatus && globalAuthenticatedUser.id != null && globalAuthenticatedUser.id != 0) {
        await getSubscriptionStatus();
      }
      // startShowContactsPage();
    }
  }

  startShowContactsPage() async {
    // show alert
    final db = await getDb();
    final box = await db.openBox("settings");
    final contactsRequested = await box.get("contactsRequested");
    showContactsPage();

    if (contactsRequested != true) {
      box.put("contactsRequested", true);
      showContactsPage();
    }
  }

  showContactsPage() {
    router.push("/share-credit");
    // showCupertinoModalBottomSheet(
    //     context: context,
    //     duration: const Duration(milliseconds: 300),
    //     expand: true,
    //     animationCurve: Curves.easeOut,
    //     isDismissible: true,
    //     builder: (context) => );
  }

  void refresh(Function c) {
    c();
    notifyListeners();
  }

  void restorePurchases() async {
    // if (Platform.isIOS || Platform.isMacOS) {
    //   processingStatusText = "Loading...";
    // }
    notifyListeners();
    print("starting restore");
    try {
      InAppPurchase.instance.restorePurchases();
    } catch (e) {
      print("error restoring purchases");
      print(e);
      // processingStatusText = "Error restoring purchases";
      notifyListeners();
    }
    print("finished restore");
  }

  Future<void> getSubscriptionStatus() async {
    if (globalAuthenticatedUser.id == null || globalAuthenticatedUser.id == 0) {
      return;
    }
    loadingSubscriptionStatus = true;
    error = "";
    notifyListeners();
    print("getting subscription status");
    final result = await getRequest("/api/subscription-status");
    print("got subscription status");
    loadingSubscriptionStatus = false;
    if (result.error != null) {
      error = result.error ?? "Error";
      notifyListeners();
      return;
    }
    subscriptionStatusLoaded = true;
    currentPlan = result.result["planId"];
    globalStore.selectedPlan = currentPlan;
    mainViewState.update();
    token = result.result["androidToken"];
    planInfoFromServer = result.result["plans"];
    notifyListeners();

  }

  Future<void> getPlans() async {
    final result = await getRequest("/api/get-app-plans");
    if (result.error != null) {
      error = result.error ?? "Error";
      notifyListeners();
      return;
    }
    planInfoFromServer = result.result["items"];
    notifyListeners();
  }

  var numTries = 0;
  Future<void> getIapObjects() async {
    loadingProducts = true;
    numTries++;
    getPlans();
    print("getting product details");
    ProductDetailsResponse productDetailResponse;
    final bool available = await InAppPurchase.instance.isAvailable();
    if (!available) {
      if (numTries < 2) {
        // wait 3 seconds
        await Future.delayed(const Duration(seconds: 3));
        await getIapObjects();
        return;
      }
      print("store is not available");
      error = "Store not available";
      loadingProducts = false;
      notifyListeners();
      return;
    }
    try {
      print("country code");
      print("querying product details ${productIds.toSet()}");
      print(WidgetsBinding.instance.platformDispatcher.locale.countryCode);
      // productDetailResponse = await iap.queryProductDetails(productIds.toSet());
      // var info = true || Platform.isAndroid && !(WidgetsBinding.instance.platformDispatcher.locale.countryCode == "US")
      //         ? singlePurchaseIds.toSet()
      //         : productIds.toSet();
      var info = productIds.toSet();
      productDetailResponse = await iap.queryProductDetails(info);
    } catch (e) {
      if (numTries < 2) {
        // wait 3 seconds
        await Future.delayed(const Duration(seconds: 3));
        await getIapObjects();
        return;
      }
      print("error getting product details iap");
      print(e);
      error = "$e contact support@dreamgenerator.ai if this persists. Sorry for the issue, I don't know what's going on.";
      loadingProducts = false;
      notifyListeners();
      return;
    }
    print("got product details");
    print(productDetailResponse.productDetails);
    loadingProducts = false;
    if (productDetailResponse.notFoundIDs.isNotEmpty) {
      error =
          "Some products were not found: ${productDetailResponse.notFoundIDs} contact support@dreamgenerator.ai if this persists. Sorry for the issue, I don't know what's going on.";
    } else {
      products = productDetailResponse.productDetails;
      // reorder products by productIds order
      products.sort((a, b) => productIds.indexOf(a.id).compareTo(productIds.indexOf(b.id)));
    }
    if (Platform.isAndroid) {
      // only show last
      // products = [products.last];
    }
    print(products);
    notifyListeners();
  }

  Future startIap(ProductDetails productDetails, int index) async {
    print("buying product");
    error = "";
    purchasing = true;
    notifyListeners();
    if (Platform.isIOS) {
      final paymentWrapper = SKPaymentQueueWrapper();
      final transactions = await paymentWrapper.transactions();
      print("getting existing transactions");
      print(transactions);
      for (var transaction in transactions) {
        print("purchasing transaction");
        print(transaction);
        try {
          await paymentWrapper.finishTransaction(transaction);
        } catch (err) {
          print("error finishing transaction");
          print(err);
        }
        // await paymentWrapper.finishTransaction(transaction);
      }
    }
    try {
      if (Platform.isAndroid && currentPlan != null && currentPlan != "") {
        print(currentPlan);
        print(token);
        final verificationData = PurchaseVerificationData(localVerificationData: token!, serverVerificationData: token!, source: token!);

        //  sku: purchaseParam.productDetails.id,
        //     accountId: purchaseParam.applicationUserName,
        //     oldSku: changeSubscriptionParam?.oldPurchaseDetails.productID,
        //     purchaseToken: changeSubscriptionParam
        //         ?.oldPurchaseDetails.verificationData.serverVerificationData,
        //     prorationMode: changeSubscriptionParam?.prorationMode);

        // final oldPurchaseDetails = GooglePlayPurchaseDetails(productID: currentPlan!, verificationData: , transactionDate: DateTime.now().millisecondsSinceEpoch.toString(), status: PurchaseStatus.purchased);

        //       final BillingResultWrapper billingResultWrapper = await purchaseViewData.iap.billingClient.launchBillingFlow(
        //         sku: purchaseParam.productDetails.id,
        //         accountId: purchaseParam.applicationUserName,
        //         oldSku: changeSubscriptionParam?.oldPurchaseDetails.productID,
        //         purchaseToken: changeSubscriptionParam
        //             ?.oldPurchaseDetails.verificationData.serverVerificationData,
        //         prorationMode: changeSubscriptionParam?.prorationMode);
        // return billingResultWrapper.responseCode == BillingResponse.ok;
        print(currentPlan);
        print(token);
        // PurchaseWrapper(orderId: orderId, packageName: packageName, purchaseTime: purchaseTime, purchaseToken: purchaseToken, signature: signature, products: products, isAutoRenewing: isAutoRenewing, originalJson: originalJson, isAcknowledged: isAcknowledged, purchaseState: purchaseState)
        final wrapper = PurchaseWrapper.fromJson({
          "orderId": "",
          "packageName": "",
          "purchaseTime": 0,
          "purchaseToken": token!,
          "signature": "",
          "products": const [],
          "isAutoRenewing": false,
          "originalJson": "",
          "isAcknowledged": false,
          "purchaseState": 0
        });
        print("made wrapper");
        final oldPurchaseDetails = GooglePlayPurchaseDetails(
          productID: currentPlan!,
          verificationData: verificationData,
          transactionDate: DateTime.now().millisecondsSinceEpoch.toString(),
          billingClientPurchase: wrapper,
          status: PurchaseStatus.purchased,
        );
        PurchaseParam purchaseParam = GooglePlayPurchaseParam(
            productDetails: productDetails,
            changeSubscriptionParam:
                ChangeSubscriptionParam(oldPurchaseDetails: oldPurchaseDetails, prorationMode: ProrationMode.immediateAndChargeProratedPrice));
        if (productDetails.id == "fifty_credits") {
          await purchaseViewData.iap.buyConsumable(purchaseParam: purchaseParam, autoConsume: true);
        } else {
          await purchaseViewData.iap.buyNonConsumable(purchaseParam: purchaseParam);
        }
      } else {
        if (productDetails.id == "fifty_credits") {
          await purchaseViewData.iap.buyConsumable(purchaseParam: PurchaseParam(productDetails: productDetails), autoConsume: true);
        } else {
          await purchaseViewData.iap.buyNonConsumable(purchaseParam: PurchaseParam(productDetails: productDetails));
        }
      }
      facebookAppEvent.logPurchase(amount: 2, currency: "USD").catchError((e) => {print("error logging purchase to fb"), print(e)});
      purchaseViewData.refresh(() {
        purchaseViewData.processingStatusText = "IAP Processing...";
      });
      print("bought");
    } catch (e, stacktrace) {
      purchasing = false;
      notifyListeners();
      print("error in iap");
      purchaseViewData.error = e.toString();
      print(e);
      print(stacktrace);
    }
  }
}
