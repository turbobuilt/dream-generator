import 'package:dev/helpers/better_state.dart';
import 'package:dev/main.dart';
import 'package:dev/views/upscale/upscale_view.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:provider/provider.dart';
import 'package:widget_zoom/widget_zoom.dart';

class DisplayUpscaledImageView extends StatefulWidget {
  @override
  DisplayUpscaledImageViewState createState() => DisplayUpscaledImageViewState();
}

class DisplayUpscaledImageViewState extends BetterState<DisplayUpscaledImageView> {
  final currentImageData = globalStore.currentImageData;
  var savedToPhotos = false;

  saveToPhotos() async {
    try {
      final result = await ImageGallerySaver.saveImage(currentImageData!.imageBytes!);
      print(result);
      // show toast
      if (result["isSuccess"] == true) {
        Fluttertoast.showToast(msg: "Image saved to photos");
        savedToPhotos = true;
      } else {
        Fluttertoast.showToast(msg: "Error saving image to photos");
      }
    } catch (e) {
      print("error saving image to photos");
      print(e);
      Fluttertoast.showToast(msg: "Error saving image to photos");
    }
    update(() {});
  }

  @override
  void initState() {
    super.initState();
    print("creating the display upscaled image view content");
  }

  @override
  Widget build(BuildContext context) {
    if (currentImageData == null) {
      return const Text("No image data found");
    }
    return Column(
      children: [
        LimitedBox(
          maxHeight: MediaQuery.of(context).size.height * .75,
          child: WidgetZoom(heroAnimationTag: 'tag', zoomWidget: Image.memory(currentImageData!.imageBytes!, fit: BoxFit.contain)),
        ),
        const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(height: 10),
            Text(
              "Save image to photos if you want to keep it!",
              style: TextStyle(color: Colors.black, decoration: TextDecoration.none, fontSize: 14, fontWeight: FontWeight.normal),
            ),
            SizedBox(height: 10),
            Text(
              "Otherwise it will be deleted when you close this",
              style: TextStyle(color: Colors.black, decoration: TextDecoration.none, fontSize: 14, fontWeight: FontWeight.normal),
            ),
            SizedBox(height: 10),
          ],
        ),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: () {
                  globalStore.currentImageData = null;
                  Navigator.of(context).pop();
                },
                child: const Text("Close"),
              ),
              const Spacer(),
              if (!savedToPhotos)
                ElevatedButton(
                  onPressed: () {
                    saveToPhotos();
                  },
                  child: const Text("Save To Photos"),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
