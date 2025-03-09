import 'dart:io';

import 'package:dev/helpers/router.dart';
import 'package:dev/views/display_output_view/components/image_loader.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/modify_image_view.dart';
import 'package:flutter/material.dart';

class ModifyButton extends StatelessWidget {
  DisplayOutputViewState parentState;

  ModifyButton(this.parentState);



  modifyImage() {
    editView.image = FileImage(File(parentState.imageLoader.localImageUrl!));
    customTabBarState.setTab(Views.editImageView);
    router.pop();
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: modifyImage,
      style: parentState.buttonStyle,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.palette, size: parentState.iconSize),
          // Text("👾", style: TextStyle(fontSize: iconSize)),
          const SizedBox(height: 5),
          const Text("Modify"),
        ],
      ),
    );
  }
}
