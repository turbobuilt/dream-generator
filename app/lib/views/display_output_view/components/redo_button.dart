import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/display_output_view/components/image_loader.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';

class RedoButton extends StatelessWidget {
  DisplayOutputViewState parentState;

  RedoButton(this.parentState);



  redoPrompt() async {
    final fileName = parentState.imageLoader.localImageUrl!.split('/').last;
    final data = await CurrentImageData.load(fileName);
    String? prompt = data?.prompt;
    print("prompt for image is$prompt");
    if (prompt != null) {
      parentState.safeSetState(() {
        createImageViewHistory.promptNotifier.prompt.text = prompt;
        createImageViewHistory.selectedStyle = data?.style ?? "None";
        createImageViewHistory.update();
        customTabBarState.setTab(Views.createImageView);
        mainViewState.update();
      });
    }
    // Navigator.pop(context);
    globalDisplayAllImagesViewStore.loadImagePaths();
    router.pop();
    // tabBarState.tab = Views.createImageView;
    tabBarState.update();
    mainViewState.update();
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: redoPrompt,
      style: parentState.buttonStyle,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.loop_rounded, size: parentState.iconSize),
          // Text("🔄", style: TextStyle(fontSize: iconSize)),
          const SizedBox(height: 5),
          const Text("Redo"),
        ],
      ),
    );
  }
}
