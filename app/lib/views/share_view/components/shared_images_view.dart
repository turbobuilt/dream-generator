
import 'package:flutter/cupertino.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:widget_zoom/widget_zoom.dart';

class SharedImagesView extends StatelessWidget {
  var images = [];
  SharedImagesView(this.images);

  @override
  Widget build(BuildContext context) {
    const space = 5.0;

    return SizedBox(
      height: 128,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(0, 0, space, 0),
        scrollDirection: Axis.horizontal,
        itemCount: images.length,
        itemBuilder: (context, index) {
          final image = images[index];
          return Padding(
            padding: const EdgeInsets.fromLTRB(space, space, 0, space),
            child: WidgetZoom(
              heroAnimationTag: image["path"],
              minScaleEmbeddedView: 1,
              maxScaleEmbeddedView: 1,
              zoomWidget: AvifImage.network("https://images.dreamgenerator.ai/${image["path"]}"),
            ),
          );
        },
      ),
    );
  }
}
