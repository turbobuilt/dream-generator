import 'dart:async';
import 'dart:io';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/in_app_purchase_view/in_app_purchase_view.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/top_bar_view.dart';
import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:in_app_purchase_storekit/store_kit_wrappers.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../../views/main_view/components/main_tab_bar.dart';
import 'components/submit_transaction_to_server.dart';

class IAPHandler {
  late StreamSubscription<List<PurchaseDetails>> subscription;

  startListening() async {
    print("listening");
    var paymentWrapper = SKPaymentQueueWrapper();
    if (Platform.isIOS) {
      var transactions = await paymentWrapper.transactions();
      var futures = transactions.map((transaction) async {
        print("existing transaction");
        print(transaction);
        try {
          await paymentWrapper.finishTransaction(transaction);
        } catch (err) {
          print("error finishing transaction");
          print(err);
        }
      });
      await Future.wait(futures);
    }
    final stream = InAppPurchase.instance.purchaseStream;
    subscription = stream.listen((purchaseDetailsList) {
      print("purchase details list");
      print(purchaseDetailsList);
      onPurchase(purchaseDetailsList);
    }, onDone: () {
      subscription.cancel();
    }, onError: (error) {
      // handle error here.
      print("Error listening to IAP");
      print(error);
    });
  }

  void stopListening() {
    subscription.cancel();
  }

  Function onPurchaseCancelled = () {};
  Function onPurchaseError = () {};
  Function onPurchaseSuccess = () {};
  void onPurchase(List<PurchaseDetails> purchaseDetailsList) async {
    // purchaseDetailsList.forEach((PurchaseDetails purchaseDetails) async {
    print("handling on purchase");
    print(purchaseDetailsList);
    var results = purchaseDetailsList.map((purchaseDetails) async {
      print("purchase is");
      print(purchaseDetails);
      if (purchaseDetails.status == PurchaseStatus.canceled) {
        try {
          await InAppPurchase.instance.completePurchase(purchaseDetails);
        } catch (err) {
          print("iap cancelled");
          print(err);
        }
        purchaseViewData.refresh(() {
          purchaseViewData.processingStatusText = '';
          purchaseViewData.purchasing = false;
        });
        try {
          onPurchaseCancelled();
        } catch (err) {
          print("error calling onPurchaseCancelled");
          print(err);
        }
        return;
      } else if (purchaseDetails.status == PurchaseStatus.error) {
        print("Error purchasing");
        print(purchaseDetails.error);
        print(purchaseDetails.error!.message);
        print(purchaseDetails.error!.source);
        print(purchaseDetails.error!.details);
        try {
          await InAppPurchase.instance.completePurchase(purchaseDetails);
        } catch (err) {
          print("iap cancelled/error");
          print(err);
        }
        purchaseViewData.refresh(() => {
              purchaseViewData.error = 'Error: ${purchaseDetails.error?.message ?? 'Unknown Error'}',
              purchaseViewData.processingStatusText = '',
              purchaseViewData.purchasing = false,
              print("set status to null")
            });
        try {
          onPurchaseError();
        } catch (err) {
          print("error calling onPurchaseCancelled");
          print(err);
        }
        // if it's pending and more than 5 minutes old, complete
      } else if (purchaseDetails.status == PurchaseStatus.purchased ||
          purchaseDetails.status == PurchaseStatus.restored ||
          purchaseDetails.status == PurchaseStatus.pending) {
        print(purchaseDetails.status);
        // parse string purchaseDetails.transactionDate to milliseconds
        if (purchaseDetails.status == PurchaseStatus.pending &&
            (purchaseDetails.transactionDate == null ||
                purchaseDetails.transactionDate == "" ||
                int.parse(purchaseDetails.transactionDate!) < DateTime.now().millisecondsSinceEpoch - 1000 * 60 * 1)) {
          // complete purchase if more than 1 minutes old
          // purchaseDetails.transactionDate  milliseconds since epoch
          if (purchaseDetails.pendingCompletePurchase) {
            try {
              await InAppPurchase.instance.completePurchase(purchaseDetails);
            } catch (err) {
              print("iap cancelled");
              print(err);
            }
            purchaseViewData.refresh(() => {purchaseViewData.processingStatusText = '', purchaseViewData.purchasing = false});
          }
          return;
        }
        print(purchaseDetails);
        if (purchaseDetails.purchaseID == null) {
          return;
        }
        print(purchaseDetails.purchaseID);
        print("local verification data");
        purchaseViewData.refresh(() => {purchaseViewData.processingStatusText = 'Verifying Purchase'});
        // router.configuration.navigatorKey.currentWidget.pages[-1].name;
        TransactionResponse result;
        try {
          result = await submitTransactionToServer(purchaseDetails);
        } catch (err, stacktrace) {
          print("error submitting transaction to server");
          print(err);
          // print stack
          print(stacktrace);
          purchaseViewData.refresh(() => {
                purchaseViewData.error =
                    'Error submitting transaction to server. Please contact support at support@dreamgenerator.ai. This is important because I think your card was charged but you didn\'t get access.  I apologize, please let me know and I will fix! $err',
                purchaseViewData.processingStatusText = '',
                purchaseViewData.purchasing = false,
                print("set status to null")
              });
          try {
            await InAppPurchase.instance.completePurchase(purchaseDetails);
          } catch (err) {
            print("iap cancelled");
            print(err);
          }
          return;
        }
        print("result");
        print(result.result);
        print("result err:");
        print(result.error);
        if (result.error != null) {
          print(result.error);
          purchaseViewData.refresh(() => {
                purchaseViewData.error = 'Error: ${result.error ?? 'Unknown Error'}',
                purchaseViewData.processingStatusText = '',
                purchaseViewData.purchasing = false,
                print("set status to null")
              });
          try {
            await InAppPurchase.instance.completePurchase(purchaseDetails);
          } catch (err) {
            print("iap cancelled");
            print(err);
          }
        }
        print("result result");
        print(result.result);
        if (result.result != null) {
          Fluttertoast.showToast(
            msg: 'Purchase successful',
            toastLength: Toast.LENGTH_SHORT,
            gravity: ToastGravity.BOTTOM,
            timeInSecForIosWeb: 1,
            backgroundColor: const Color.fromARGB(255, 66, 66, 66),
            textColor: Colors.white,
            fontSize: 16.0,
          );
          if (result.result["authenticatedUser"] != null) {
            setUserData(result.result["authenticatedUser"], result.result["token"]);
            mainViewState.update();
            purchaseViewData.processingStatusText = '';
            purchaseViewData.purchasing = false;
            globalTopBarViewData.update();
            mainViewState.update();
          } else if (result.result['creditsRemaining'] != null) {
            purchaseViewData.refresh(() {
              globalAuthenticatedUser.creditsRemaining = double.tryParse((result.result['creditsRemaining'] ?? 0).toString()) ?? 0;
              globalStore.saveUserData();
              purchaseViewData.processingStatusText = '';
              purchaseViewData.purchasing = false;
              globalTopBarViewData.update();
              mainViewState.update();
            });
          }
          try {
            await InAppPurchase.instance.completePurchase(purchaseDetails);
          } catch (err) {
            purchaseViewData.error = 'Error completing purchase: $err';
            print("iap cancelled");
            print(err);
          }
          // load user details again
          try {
            await globalStore.fetchAuthenticatedUser();
          } catch (err) {
            purchaseViewData.error = 'Error fetching user info $err';
            print("error fetching authenticated user");
            print(err);
          }
          try {
            await purchaseViewData.getSubscriptionStatus();
          } catch (err) {
            purchaseViewData.error = 'Error fetching subscription status $err';
            print("error fetching subscription status");
            print(err);
          }
          purchaseViewData.refresh(() => {});
          mainViewState.update();
          // if (router.routeInformationProvider.value.location != '/start-register-modal' &&
          //     router.routeInformationProvider.value.location != '/home') {
          if (router.canPop()) {
            router.pop();
          }
          router.push('/home');
          // router.push('/home');
          print("pushed home");
          // }
        } else {
          print("Error handling IAP");
          print(result);
          print(purchaseDetails);
          purchaseViewData.refresh(
            () => {
              purchaseViewData.error = 'Error: ${result.error ?? 'Unknown Error'}',
              purchaseViewData.processingStatusText = '',
              purchaseViewData.purchasing = false,
              print("set status to null")
            },
          );
        }
      }
    });
    await Future.wait(results);
  }
}
