import 'dart:io';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/display_output_view/components/image_loader.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:flutter/material.dart';

class DeleteButton extends StatefulWidget {
  DisplayOutputViewState parentState;

  DeleteButton(this.parentState);

  @override
  DeleteButtonState createState() => DeleteButtonState();

}

class DeleteButtonState extends BetterState<DeleteButton> {
  var showDeleteMessage = false;

  deletePressed() {
    if (!showDeleteMessage) {
      update(() {
        showDeleteMessage = true;
      });
    } else {
      deleteImage();
    }
  }

  deleteImage() async {
    File(widget.parentState.imageLoader.localImageUrl!).deleteSync();
    final fileName = widget.parentState.imageLoader.localImageUrl!.split('/').last;
    final data = await CurrentImageData.load(fileName);
    await data?.delete();
    widget.parentState.safeSetState(() {
      widget.parentState.imageLoader.localImageUrl = null;
      widget.parentState.imageLoader.image = null;
      widget.parentState.imageLoader.error = null;
      widget.parentState.imageLoader.saveMessage = null;
      globalDisplayAllImagesViewStore.loadImagePaths();
      router.pop();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: deletePressed,
      style: widget.parentState.buttonStyle,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.delete_forever, size: widget.parentState.iconSize),
          const SizedBox(height: 5),
          Text(showDeleteMessage ? "Push Again to Delete" : "Delete", textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
