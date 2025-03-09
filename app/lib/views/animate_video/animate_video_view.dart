import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/animate_video/animate_video_state.dart';
import 'package:dev/widgets/credits_row.dart';
import 'package:flutter/material.dart';

class AnimateVideoView extends SmartWidget<AnimateVideoState> {
  AnimateVideoView() {
    state = animateVideoState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          CreditsRow(),
          Text("Animate Video View"),
          if (animateVideoState.videoPath != null) Text('Video path: $animateVideoState.videoPath'),
          ElevatedButton(
            onPressed: animateVideoState.pickAndUploadVideo,
            child: Text('Pick and Upload Video'),
          ),
        ],
      ),
    );
  }
}
