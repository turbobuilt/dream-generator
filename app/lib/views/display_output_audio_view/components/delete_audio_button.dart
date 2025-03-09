import 'dart:io';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/display_output_audio_view/display_output_audio_view.dart';
import 'package:dev/views/display_output_view/components/image_loader.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/generate_audio/generate_audio_state.dart';
import 'package:flutter/material.dart';

class DeleteAudioButton extends StatefulWidget {
  DisplayOutputAudioViewState parentState;

  DeleteAudioButton(this.parentState);

  @override
  DeleteAudioButtonState createState() => DeleteAudioButtonState();
}

class DeleteAudioButtonState extends BetterState<DeleteAudioButton> {
  var showDeleteMessage = false;

  deletePressed() {
    if (!showDeleteMessage) {
      update(() {
        showDeleteMessage = true;
      });
    } else {
      delete();
    }
  }

  delete() async {
    await widget.parentState.widget.generateAudioRequest.delete();
    widget.parentState.safeSetState(() {
      generateAudioState.audioFiles.remove(widget.parentState.widget.generateAudioRequest);
      generateAudioState.update();
    });
    router.pop();
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
