import 'package:dev/helpers/better_state.dart';
import 'package:flutter/material.dart';

import '../../../create_image_view.dart';

class AspectRatioSelector extends StatefulWidget {
  final CreateImageViewState createImageViewState;
  const AspectRatioSelector(this.createImageViewState);

  @override
  AspectRatioSelectorState createState() => AspectRatioSelectorState();
}

// contains a slider with 3 values
class AspectRatioSelectorState extends BetterState<AspectRatioSelector> {
  var aspectRatio = 1.0;
  var aspectRatioText = "1:1";

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text("Aspect Ratio"),
        Slider(
          value: aspectRatio,
          min: 0.5,
          max: 2.0,
          divisions: 5,
          label: aspectRatioText,
          onChanged: (value) {
            update(() {
              aspectRatio = value;
              aspectRatioText = "${value.toStringAsFixed(1)}:1";
            });
          },
        ),
      ],
    );
  }
}