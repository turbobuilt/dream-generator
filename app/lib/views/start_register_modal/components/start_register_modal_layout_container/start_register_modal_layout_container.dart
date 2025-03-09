import 'package:dev/main.dart';
import 'package:dev/views/in_app_purchase_view/components/in_app_purchase_view_state/in_app_purchase_view_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../background_slideshow_widget.dart';

class StartRegisterModalLayoutContainer extends StatelessWidget {
  Widget child;
  var backgroundImagePaths = [
    "assets/images/171.avif",
    // "assets/images/girl.avif",
    "assets/images/179.avif",
    "assets/images/galaxy_big.avif",
    "assets/images/lion.avif",
  ];
  TextStyle defaultTextStyle;
  StartRegisterModalLayoutContainer({required this.child, required this.defaultTextStyle});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: purchaseViewData,
      child: Consumer<InAppPurchaseViewState>(
        builder: (context, notifier, builderChild) {
          return LayoutBuilder(builder: (context, constraints) {
            return Container(
              color: const Color.fromARGB(255, 48, 48, 48),
              child: Stack(
                children: [
                  Dialog(
                    shadowColor: Colors.transparent,
                    backgroundColor: Colors.transparent, // const Color.fromARGB(255, 32, 31, 31),
                    alignment: Alignment.center,
                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                    insetPadding: const EdgeInsets.all(0),
                    child: SafeArea(
                      bottom: true,
                      left: false,
                      right: false,
                      child: DefaultTextStyle(style: defaultTextStyle, child: child),
                    ),
                  ),
                ],
              ),
            );
          });
        },
      ),
    );
  }
}
