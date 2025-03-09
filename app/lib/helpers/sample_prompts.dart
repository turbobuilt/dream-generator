import 'package:dev/helpers/better_state.dart';
import 'package:dev/main.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:flutter/material.dart';
import 'package:time_machine/time_machine.dart';

class SamplePrompts extends StatefulWidget {
  final CreateImageView parentWidget;
  final CreateImageViewState parentState;
  final List<String> prompts = [
    "The most beautiful woman that ever lived, colorful digital art",
    "A roaring lion, digital art.",
    "The most beautiful landscape ever created"
  ];
  SamplePrompts(this.parentWidget, this.parentState);

  @override
  SamplePromptsState createState() => SamplePromptsState();
}

class SamplePromptsState extends BetterState<SamplePrompts> {
  bool open = false;

  onChange(String text) {
    widget.parentWidget.createImageViewData.promptNotifier.update(text);
    widget.parentWidget.createImageViewData.promptId = null;
    widget.parentWidget.createImageViewData.createImage();
  }

  @override
  Widget build(BuildContext context) {
    if (globalDisplayAllImagesViewStore.imagePaths.isEmpty && !widget.parentWidget.createImageViewData.processing) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 0),
        child: Column(children: [
          GestureDetector(
            behavior: HitTestBehavior.translucent,
            onTap: () {
              update(() {
                open = !open;
              });
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 12),
              child: Row(
                children: [
                  AnimatedRotation(
                    duration: const Duration(milliseconds: 300),
                    turns: open ? .25 : 0,
                    child: const Icon(
                      Icons.keyboard_arrow_right,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const Text(
                    'Sample ideas',
                    style: TextStyle(fontSize: 15, color: Colors.white, height: 1),
                    textAlign: TextAlign.start,
                  ),
                ],
              ),
            ),
          ),
          if (open) ...{
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 0, 10, 5),
              child: ListView(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                children: [
                  ...widget.prompts.map((text) {
                    return GestureDetector(
                      onTap: () => onChange(text),
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 20),
                        child: Text(
                          text,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 15, color: Colors.white, decoration: TextDecoration.underline),
                        ),
                      ),
                    );
                  }).toList(),
                ],
              ),
            )
          }
        ]),
      );
    } else {
      return const SizedBox(height: 0);
    }
  }
}
