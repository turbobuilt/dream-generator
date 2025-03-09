import 'package:dev/main.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'components/image_quality_selector.dart';

class ImageSettings extends StatelessWidget {
  CreateImageView parentWidget;
  CreateImageViewState parentWidgetState;

  ImageSettings(this.parentWidget, this.parentWidgetState);

  @override
  Widget build(BuildContext context) {
    Color textColor = const Color.fromARGB(255, 214, 214, 214);
    Color bgColor = const Color.fromARGB(255, 82, 82, 82);
    
    if (parentWidgetState.computedTheme() == ViewTheme.light) {
      textColor = const Color.fromARGB(255, 57, 57, 57);
      bgColor = Colors.white;
    }
    var defaultPadding = const EdgeInsets.symmetric(vertical: 4, horizontal: 6);
    if (globalAuthenticatedUser.plan == null || globalAuthenticatedUser.plan == "free" || globalAuthenticatedUser.plan == "") {
      return const SizedBox(height: 0);
    }
    return ChangeNotifierProvider.value(
      value: parentWidget.createImageViewData.promptNotifier,
      child: Consumer<PromptNotifier>(
        builder: (context, notifier, child) {
          if (parentWidget.createImageViewData.promptNotifier.prompt.text.isNotEmpty) {
            var widgets = [ImageQualitySelector(parentWidgetState, defaultPadding)].map((item) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      color: bgColor,
                      // decoration: BoxDecoration(
                      //   border: Border.all(
                      //     color: textColor,
                      //     width: 1,
                      //   ),
                      //   borderRadius: BorderRadius.circular(0),
                      // ),
                      // padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
                      child: DefaultTextStyle(
                        style: TextStyle(color: textColor),
                        child: item,
                      ),
                    ),
                  ],
                ),
              );
            }).toList();
            return Row(children: widgets);
          } else
            return const SizedBox(height: 0);
        },
      ),
    );
  }
}
