import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../main.dart';
import '../create_image_view.dart';

class PromptInput extends StatefulWidget {
  final CreateImageView parentWidget;
  final CreateImageViewState parentState;

  const PromptInput(this.parentWidget, this.parentState);

  @override
  PromptInputState createState() => PromptInputState();
}

class PromptInputState extends State<PromptInput> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget.parentWidget.createImageViewData.promptNotifier,
      child: Consumer<PromptNotifier>(
        builder: (context, notifier, child) {
          return TextField(
            style: TextStyle(
              fontSize: 15,
              height: 1.1,
              color: widget.parentState.computedTheme() == ViewTheme.light ? Colors.black : Colors.white,
            ),
            decoration: InputDecoration(
              hintText: "Tap here to create your own image",
              hintStyle: TextStyle(
                fontSize: 16,
                height: 1.4,
                color: widget.parentState.computedTheme() == ViewTheme.light
                    ? const Color.fromARGB(255, 57, 57, 57)
                    : const Color.fromARGB(255, 214, 214, 214),
              ),
              border: InputBorder.none,
              contentPadding:
                  EdgeInsets.fromLTRB(0, 14, 0, widget.parentWidget.expand && !widget.parentWidget.createImageViewData.processing ? 7 : 14),
            ),
            controller: widget.parentWidget.createImageViewData.promptNotifier.prompt,
            enabled: !widget.parentWidget.createImageViewData.processing,
            autocorrect: true,
            maxLines: 10,
            minLines: 1,
            textAlignVertical: TextAlignVertical.center,
            autofocus: globalDisplayAllImagesViewStore.imagePaths.isEmpty,
            onTap: () {
              widget.parentWidget.createImageViewData.promptId = null;
              tapOutsideOverlayState.show();
            },
            onTapOutside: (b) {
              tapOutsideOverlayState.hide();
              FocusManager.instance.primaryFocus?.unfocus();
            },
            textInputAction: TextInputAction.send,
            onSubmitted: (value) => widget.parentWidget.createImageViewData.createImage(),
          );
        },
      ),
    );
  }
}
