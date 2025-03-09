// import 'package:audio_waveforms/audio_waveforms.dart';
// import 'package:dev/helpers/better_state.dart';
// import 'package:dev/models/GenerateAudioRequest.dart';
// import 'package:dev/vars.dart';
// import 'package:dev/views/display_output_audio_view/display_output_audio_view.dart';
// import 'package:flutter/material.dart';

// class AudioDisplay extends StatefulWidget {
//   GenerateAudioRequest generateAudioRequest;
//   bool autoPlay;

//   AudioDisplay(this.generateAudioRequest, {this.autoPlay = false});

//   @override
//   AudioDisplayState createState() => AudioDisplayState();
// }

// // use audio_waveforms
// class AudioDisplayState extends BetterState<AudioDisplay> {
//   PlayerController controller = PlayerController(); // Initialise
//   List<double> waveformData = []; // Waveform data

//   @override
//   void initState() {
//     super.initState();
//     init();
//   }

//   init() async {
//     var path = await widget.generateAudioRequest.getLocalPath();
//     print("path is $path");
//     await controller.preparePlayer(
//       path: path,
//       shouldExtractWaveform: true,
//       noOfSamples: 100,
//       volume: 1.0,
//     );
//     if (widget.autoPlay) {
//       controller.startPlayer();
//     }
//   }

//   @override
//   void dispose() {
//     super.dispose();
//     controller.stopAllPlayers(); // Stop all registered audio players
//     controller.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     print("Width is ${MediaQuery.of(context).size.width}");
//     return Row(
//       children: [
//         // play/stop icon
//         if (true || !controller.playerState.isStopped)
//           IconButton(
//             onPressed: () async {
//               controller.playerState.isPlaying
//                   ? await controller.pausePlayer()
//                   : await controller.startPlayer(
//                       finishMode: FinishMode.loop,
//                     );
//               update();
//             },
//             icon: Icon(
//               controller.playerState.isPlaying ? Icons.stop : Icons.play_arrow,
//             ),
//             color: Colors.blue,
//             splashColor: Colors.transparent,
//             highlightColor: Colors.transparent,
//           ),
//         Expanded(
//           child: LayoutBuilder(
//             builder: (context, constraints) {
//               var maxWidth = constraints.maxWidth * .8;
              
//             }
//           ),
//         ),
//       ],
//     );
//   }
// }
