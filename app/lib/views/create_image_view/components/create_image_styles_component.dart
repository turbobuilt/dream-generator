import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../main.dart';
import '../../in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import '../create_image_view.dart';

class CreateImageStylesComponent extends StatelessWidget {
  final CreateImageView parentWidget;
  final CreateImageViewState parentWidgetState;

  const CreateImageStylesComponent(this.parentWidget, this.parentWidgetState);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100.0,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: parentWidget.createImageViewData.styleImageNames.length,
        itemBuilder: (BuildContext context, int index) {
          return Container(
            margin: const EdgeInsets.fromLTRB(5, 0, 0, 10),
            decoration: BoxDecoration(
              border: Border.all(
                color:
                    parentWidget.createImageViewData.selectedStyle == parentWidget.createImageViewData.styleImageNames[index] ? Colors.blue : Colors.transparent,
                width: 3,
              ),
            ),
            child: InkWell(
              onTap: () {
                parentWidgetState.update(() {
                  parentWidget.createImageViewData.selectedStyle = parentWidget.createImageViewData.styleImageNames[index];
                });
              },
              child: Stack(
                children: [
                  Image.asset(parentWidgetState.getImagePath(parentWidget.createImageViewData.styleImageNames[index])),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      color: Colors.white.withOpacity(0.9),
                      padding: const EdgeInsets.all(2),
                      child: Text(
                        parentWidget.createImageViewData.styleImageNames[index],
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                          // ellipsis
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
