import 'dart:io';

import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:widget_zoom/widget_zoom.dart';

class ZoomableImageDisplay extends StatelessWidget {
  DisplayOutputViewState parentState;

  ZoomableImageDisplay(this.parentState);

  @override
  Widget build(BuildContext context) {
    return LimitedBox(
      maxHeight: MediaQuery.of(context).size.height * .75,
      child: WidgetZoom(heroAnimationTag: 'tag', zoomWidget: Image(image: FileImage(File(parentState.imageLoader.localImageUrl!)), fit: BoxFit.contain)),
    );
  }
}
