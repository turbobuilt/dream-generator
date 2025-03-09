import 'dart:io';
import 'dart:ui';

import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class ImageBackdrop extends StatelessWidget {
  DisplayOutputViewState parentState;

  ImageBackdrop(this.parentState);

  @override
  Widget build(BuildContext context) {
    return Container(
      // background image is the image
      decoration: BoxDecoration(
        image: DecorationImage(
          image: FileImage(File(parentState.imageLoader.localImageUrl!)),
          fit: BoxFit.cover,
        ),
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
        child: Container(
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.0)),
        ),
      ),
    );
  }
}
