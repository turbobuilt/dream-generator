import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/display_output_audio_view/display_output_audio_view.dart';
import 'package:flutter/material.dart';

class DownloadingAudio extends StatefulWidget {
  DisplayOutputAudioViewState parentState;

  DownloadingAudio(this.parentState);

  @override
  DownloadingAudioState createState() => DownloadingAudioState();
}

class DownloadingAudioState extends BetterState<DownloadingAudio> {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.black, decoration: TextDecoration.none),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 100),
            const Text("Downloading Audio!", style: TextStyle(fontSize: 18.0)),
            const SizedBox(height: 20),
            Center(child: Text("${(widget.parentState.downloadProgress*100).toStringAsFixed(0)}%", style: const TextStyle(fontSize: 17.0))),
            const SizedBox(height: 40),
            CircularProgressIndicator(value: widget.parentState.downloadProgress),
          ],
        ),
      ),
    );
  }
}