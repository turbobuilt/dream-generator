import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../main.dart';
import '../../in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import '../create_image_view.dart';

class CreateImageButton extends StatelessWidget {
  final CreateImageView parentWidget;
  final CreateImageViewState parentWidgetState;

  const CreateImageButton(this.parentWidget, this.parentWidgetState);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: purchaseViewData,
      child: Consumer<InAppPurchaseViewState>(
        builder: (context, notifier, child) {
          return ChangeNotifierProvider.value(
            value: parentWidget.createImageViewData.promptNotifier,
            child: Consumer<PromptNotifier>(
              builder: (context, notifier, child) {
                if ((parentWidget.createImageViewData.promptNotifier.prompt.text.isNotEmpty == true || parentWidget.expand) &&
                    !parentWidget.createImageViewData.processing) {
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
                    child: ElevatedButton(
                        onPressed: parentWidgetState.createImage,
                        child: Text(
                          parentWidget.createImageViewData.promptNotifier.prompt.text.length >= parentWidget.createImageViewData.minChars
                              ? (parentWidget.createImageViewData.loadingIap || purchaseViewData.processingStatusText.isNotEmpty
                                  ? (parentWidget.createImageViewData.loadingIap ? "Working..." : purchaseViewData.processingStatusText)
                                  : "Create")
                              : ("${parentWidget.createImageViewData.minChars - parentWidget.createImageViewData.promptNotifier.prompt.text.length} More Characters"),
                          style: const TextStyle(fontSize: 15),
                        )),
                  );
                } else {
                  return Container();
                }
              },
            ),
          );
        },
      ),
    );
  }
}
