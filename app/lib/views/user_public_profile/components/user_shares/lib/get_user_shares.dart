import 'package:dev/helpers/network_helper.dart';
import 'package:flutter/material.dart';

getUserShares(BuildContext context, String userName, int page) async {
  try {
    final result = await getRequest("/api/get-user-shares?userName=$userName&page=$page");
    if (result.error?.isNotEmpty == true) {
      if (context.mounted) {
        showAlert("Error", context: context, message: result.error ?? "Error loading shares");
      }
      return [];
    }
    return result.result["items"];
  } catch (err) {
    print(err);
    return [];
  }
}
