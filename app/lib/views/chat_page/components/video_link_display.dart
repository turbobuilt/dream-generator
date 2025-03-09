import 'package:dev/helpers/better_state.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class VideoLinkDisplay extends StatefulWidget {
  final String videoCallLink;
  const VideoLinkDisplay(this.videoCallLink);

  @override
  VideoLinkDisplayState createState() => VideoLinkDisplayState();
}

class VideoLinkDisplayState extends BetterState<VideoLinkDisplay> {


  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        // print("video call link tapped");
        // open 
        launchUrl(Uri.parse(widget.videoCallLink), mode: LaunchMode.inAppBrowserView);
      },
      child: Container(
        color: Colors.white,
        child: const Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: [
              Text("Join Video Call"),
              // Text(widget.videoCallLink),
            ],
          ),
        ),
      ),
    );
  }
}