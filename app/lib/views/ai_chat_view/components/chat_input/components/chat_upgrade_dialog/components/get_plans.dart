import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

class GetIapObjectsResult {
  String error = "";
  List<ProductDetails>? products;

  GetIapObjectsResult({this.products, this.error = ""});
}

Future<GetIapObjectsResult> getIapObjects(List<String> productIds) async {
  print("getting product details");
  ProductDetailsResponse productDetailResponse;
  final InAppPurchase iap = InAppPurchase.instance;
  final bool available = await InAppPurchase.instance.isAvailable();
  if (!available) {
    print("store is not available");
    return GetIapObjectsResult(error: "Store not available");
  }
  try {
    print("country code");
    print(WidgetsBinding.instance.platformDispatcher.locale.countryCode);
    productDetailResponse = await iap.queryProductDetails(productIds.toSet());
  } catch (e) {
    print("error getting product details iap");
    print(e);
    return GetIapObjectsResult(error: "$e contact support@dreamgenerator.ai if this persists. Sorry for the issue, I don't know what's going on.");
  }
  print("got product details");
  print(productDetailResponse.productDetails);
  if (productDetailResponse.notFoundIDs.isNotEmpty) {
    return GetIapObjectsResult(
        error:
            "Some products were not found: ${productDetailResponse.notFoundIDs} contact support@dreamgenerator.ai if this persists. Sorry for the issue, I don't know what's going on.");
  }
  var products = productDetailResponse.productDetails;
  // reorder products by productIds order
  products.sort((a, b) => productIds.indexOf(a.id).compareTo(productIds.indexOf(b.id)));

  if (Platform.isAndroid) {
    // only show last
    products = [products.last];
  }
  print(products);

  return GetIapObjectsResult(products: products);
}
