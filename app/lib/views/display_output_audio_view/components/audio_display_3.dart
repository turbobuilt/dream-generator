// import 'dart:typed_data';

// import 'package:dev/helpers/better_state.dart';
// import 'package:dev/models/GenerateAudioRequest.dart';
// import 'package:flutter/material.dart';
// import 'package:audioplayers/audioplayers.dart';
// import 'package:flutter_sound/flutter_sound.dart';

// class AudioDisplay extends StatefulWidget {
//   GenerateAudioRequest generateAudioRequest;
//   bool autoPlay;

//   AudioDisplay(this.generateAudioRequest, {this.autoPlay = false});

//   @override
//   AudioDisplayState createState() => AudioDisplayState();
// }

// class AudioDisplayState extends BetterState<AudioDisplay> {
//   late Duration maxDuration;
//   late Duration elapsedDuration;
//   late AudioPlayer? audioPlayer;
//   late List<double> samples;
//   late int totalSamples;

//   @override
//   void initState() {
//     super.initState();
//   }

//   @override
//   void dispose() {
//     super.dispose();
//   }

//   void load() async {
//     FlutterSoundPlayer flutterSound = FlutterSoundPlayer();
//     await flutterSound.openPlayer();
//     String path = await widget.generateAudioRequest.getLocalPath();
//     // await flutterSound.pcm
//     var helper = FlutterSoundHelper();
//     // helper.
//     // flutterSound.

//     Uint8List rawData = await flutterSound.readFile(path);

//     // Process rawData as 16-bit PCM
//     Int16List pcmData = Int16List.view(rawData.buffer);

//     // Use pcmData as needed
//     print(pcmData);

//     await flutterSound.closeAudioSession();

//     // audioPlayer = AudioPlayer();
//     // audioPlayer?.onDurationChanged.listen((event) {
//     //   maxDuration = event;
//     //   update();
//     // });
//     // audioPlayer?.onPositionChanged.listen((event) {
//     //   elapsedDuration = event;
//     //   update();
//     // });
//     // audioPlayer?.setSourceDeviceFile(await widget.generateAudioRequest.getLocalPath());
//     // // get raw bytes

//     // update();
//   }

//   void unload() {
//     elapsedDuration = Duration.zero;
//     maxDuration = Duration.zero;
//     audioPlayer?.dispose();
//     audioPlayer = null;
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Container();
//   }
// }
