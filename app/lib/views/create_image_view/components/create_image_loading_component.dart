import 'package:flutter/material.dart';

import '../../../widgets/BouncingLoadingDots.dart';
import '../create_image_view.dart';

class CreateImageLoadingComponent extends StatelessWidget {
  final CreateImageView parentWidget;
  final CreateImageViewState parentWidgetState;
  const CreateImageLoadingComponent(this.parentWidget, this.parentWidgetState);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(7, 5, 7, 18),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ConstrainedBox(
                // any height, max width is 200
                constraints: BoxConstraints.loose(const Size(150, double.infinity)),
                child: BouncingLoadingDots(),
              ),
              const SizedBox(width: 7),
              const Spacer(),
              Text(
                parentWidget.createImageViewData.processingStatus,
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.normal,
                    color: parentWidgetState.computedTheme() == ViewTheme.dark ? Colors.white : Colors.black),
              ),
              // const SizedBox(width: 2)
            ],
          ),
          // if (parentWidget.expand) ...{
            const SizedBox(height: 25),
             Text(
              "Takes about 30 seconds...",
              textAlign: TextAlign.center,
              style: TextStyle(color: parentWidgetState.computedTheme() == ViewTheme.dark ? Colors.white : Colors.black)
            ),
            const SizedBox(height: 5),
          // }
        ],
      ),
    );
  }
}
