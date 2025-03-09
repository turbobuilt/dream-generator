import 'package:dev/views/app/global_store.dart';
import 'package:dev/views/start_register_modal/components/base_modal_state.dart';
import 'package:dev/views/start_register_modal/start_register_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../../../../../main.dart';
import '../../../upgrade_modal.dart';

class SubscriptionChoiceComponent extends StatelessWidget {
  BaseModalState outOfCreditsModalState;
  ProductDetails? product;

  SubscriptionChoiceComponent(this.outOfCreditsModalState, this.product);

  @override
  Widget build(BuildContext context) {
    var isSelected = globalStore.selectedPlan == product?.id;
    var intervalText = product?.id.contains('fifty') == true ? 'ONE TIME - no subscription' : 'Credits Monthly';
    var intervalAbreviation = product?.id.contains('fifty') == true ? '' : '/mo';
    var productTitle = product?.title ?? "Ad Supported";
    // get content up to first parenthesis
    productTitle = productTitle.split('(')[0].trim();
    return GestureDetector(
      onTap: () {
        outOfCreditsModalState.update(() {
          globalStore.selectedPlan = product?.id;
        });
      },
      child: Container(
          // rounded border 2px solid blue if outOfCreditsModalState.selectedPlan = product.id
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected ? Colors.blue : Colors.grey.shade400,
              width: isSelected ? 2 : 1,
            ),
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow:
                isSelected ? [BoxShadow(color: const Color.fromARGB(255, 21, 122, 180).withOpacity(0.5), spreadRadius: 2, blurRadius: 4, offset: const Offset(0, 0))] : [],
          ),
          padding: isSelected ? const EdgeInsets.fromLTRB(7, 4, 10, 4) : const EdgeInsets.fromLTRB(10, 8, 10, 8),
          child: DefaultTextStyle(
            // black text
            style: const TextStyle(color: Colors.black),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // radio button
                    Radio(
                      visualDensity: const VisualDensity(horizontal: VisualDensity.minimumDensity, vertical: VisualDensity.minimumDensity),
                      // materialTapTargetSize: ,
                      fillColor: MaterialStateProperty.all(isSelected ? Colors.blue : Colors.grey.shade400),
                      value: product?.id,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      groupValue: globalStore.selectedPlan,
                      onChanged: (value) {
                        outOfCreditsModalState.update(() {
                          globalStore.selectedPlan = value ?? "";
                        });
                      },
                    ),
                    Text(productTitle, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                  ],
                ),
                if (isSelected && product != null) ...{
                  Padding(
                    padding: const EdgeInsets.only(left: 2),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("${purchaseViewData.planInfoFromServer[product!.id]?['credits']?.toString() ?? ""} $intervalText",
                            style: const TextStyle(fontSize: 14)),
                        Text("${product!.price}$intervalAbreviation", style: const TextStyle(fontSize: 14)),
                      ],
                    ),
                  ),
                }
              ],
            ),
          )),
    );
  }
}
