import 'package:dev/views/display_output_view/components/image_loader.dart';
import 'package:flutter/material.dart';

class SaveToPhotosButton extends StatelessWidget {
  ImageLoader imageLoader;
  ButtonStyle buttonStyle;
  double iconSize;

  SaveToPhotosButton(this.imageLoader, this.buttonStyle, this.iconSize);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => imageLoader.saveToPhotos(context),
      style: buttonStyle,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.photo_album_outlined, size: iconSize),
          // Text("💽", style: TextStyle(fontSize: iconSize)),
          const SizedBox(height: 5),
          const Text("To Photos"),
        ],
      ),
    );
  }
}
