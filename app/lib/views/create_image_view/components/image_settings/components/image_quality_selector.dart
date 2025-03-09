import 'dart:io';

import 'package:dev/main.dart';
import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../create_image_view.dart';
import 'cupertino_select_container.dart';
// import 'package:flutter/material.dart';

class ImageQualitySelector extends StatelessWidget {
  final CreateImageViewState createImageViewState;
  final EdgeInsets defaultPadding;
  const ImageQualitySelector(this.createImageViewState, this.defaultPadding);

  @override
  Widget build(BuildContext context) {
    var items = [
      CupertinoSelectItem(label: "Normal", value: "sdxl", price: "1 Credit", priceNumber: 1),
      CupertinoSelectItem(label: "High", value: "dalle3", price: "8 Credits", priceNumber: 8),
    ];
    if (globalAuthenticatedUser.creditsRemaining < 1 && Platform.isAndroid) {
      items = [
        CupertinoSelectItem(label: "Low", value: "sd-openjourney", price: "3 Free per day", priceNumber: .2),
      ];
      Future.delayed(const Duration(milliseconds: 1), () {
        createImageViewState.update(() {
          createImageViewState.model = "sd-openjourney";
        });
      });
    } else if (createImageViewState.model == "sd-openjourney") {
      Future.delayed(const Duration(milliseconds: 1), () {
        createImageViewState.update(() {
          createImageViewState.model = "sdxl";
        });
      });
    }
    return CupertinoSelectContainer(
      padding: defaultPadding,
      items: items,
      onSelectedItemChanged: (value) async {
        createImageViewState.update(() {
          createImageViewState.model = value;
        });
        var prefs = await SharedPreferences.getInstance();
        prefs.setString("imageGenerationModel", value);
      },
      value: createImageViewState.model,
      label: "Quality",
    );
  }
}
