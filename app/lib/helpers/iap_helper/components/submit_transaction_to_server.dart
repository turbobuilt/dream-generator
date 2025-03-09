import 'dart:io';

import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/top_bar_view.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

class TransactionResponse {
  String? error;
  dynamic result;
  TransactionResponse({required this.error, required this.result});
}

Future<TransactionResponse> submitTransactionToServer(PurchaseDetails purchaseDetails) async {
  final receipt = purchaseDetails.verificationData.serverVerificationData;
  final transactionIdentifier = purchaseDetails.purchaseID;
  final productId = purchaseDetails.productID;

  print('submitting to server');
  var body = {
    'old_receipt': receipt,
    'transactionIdentifier': transactionIdentifier,
    'productId': productId,
  };
  var url = (Platform.isIOS || Platform.isMacOS) ? '/api/client-verify-ios-transaction' : '/api/client-verify-android-transaction';
  ActionResult response;
  try {
    response = await postRequest(url, body);
  } catch (e) {
    print("error posting transaction to server");
    print(e);
    return TransactionResponse(
        error:
            'Error submitting transaction to server. Please contact support at support@dreamgenerator.ai and let me know.  I apologize.  The transaction was successful, I just had a problem verifying it so could also request a refund. Please let me know though and I will do what I can to fix for other too! Thank you, and I\'m very sorry. Sincerely, Chris',
        result: null);
  }
  if (response.error != null) {
    print("error does not equal null");
    print(response.error);
    purchaseViewData.error =
        'Error verifying - contact support@dreamgenerator.ai. Purchase was successful most likely, but network error or server error.  Don\'t repurchase unless you think there was a legitimate network error. Contact support@dreamgenerator.ai.  Sorry about the issue, working on improving this over time! Details: ${response.error}';
    purchaseViewData.processingStatusText = '';
    return TransactionResponse(error: response.error ?? 'Unexpected Error - contact support support@dreamgenerator.ai', result: null);
  }

  final json = response.result;
  // if json has "authenticatedUser" or "token"
  if (json['authenticatedUser'] != null) {
    setUserData(json['authenticatedUser'], json['token']);
  } else {
    double creditsRemaining = double.tryParse((json['creditsRemaining'] ?? 0).toString()) ?? 0;
    globalAuthenticatedUser.creditsRemaining = creditsRemaining;
    globalStore.saveUserData();
  }


  // int? newCredits = json['newCredits'];

  // Assuming you have a method updatecreditsRemaining to update the user's available credits
  await globalStore.saveUserData();
  createImageViewHistory.showInAppPurchase = false;
  createImageViewFeed.showInAppPurchase = false;
  purchaseViewData.processingStatusText = '';
  purchaseViewData.error = '';
  purchaseViewData.successText = 'Success!';

  await Future.delayed(const Duration(seconds: 2));
  purchaseViewData.successText = '';
  globalTopBarViewData.showInAppPurchase = false;

  // if go router current page is /purchase, then go back

  return TransactionResponse(error: null, result: response.result);
  // if (newCredits != null) {
  //   print('added $newCredits credits');
  // }
  // print(json);
  // print("no more options... generic error");
  // return TransactionResponse(error: 'Unexpected Error generic - contact support support@dreamgenerator.ai', result: response.result);
}
