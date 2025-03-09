// import 'dart:io';
// import 'package:flutter/material.dart';
// import 'package:flutter_sound/flutter_sound.dart';
// import 'package:path_provider/path_provider.dart';
// import 'package:flutter_audio_waveforms/flutter_audio_waveforms.dart';

// class AudioWaveformPage extends StatefulWidget {
//   @override
//   _AudioWaveformPageState createState() => _AudioWaveformPageState();
// }

// class _AudioWaveformPageState extends State<AudioWaveformPage> {
//   FlutterSoundPlayer _player = FlutterSoundPlayer();
//   List<double> _waveform = [];
//   bool _isPlaying = false;
//   double _currentPosition = 0.0;

//   @override
//   void initState() {
//     super.initState();
//     _loadAudioFile();
//   }

//   Future<void> _loadAudioFile() async {
//     Directory documentsDirectory = await getApplicationDocumentsDirectory();
//     String filePath = '${documentsDirectory.path}/your_audio_file.mp3';

//     // Generate waveform data
//     final waveform = await FlutterAudioWaveforms.extractWaveform(filePath);
//     setState(() {
//       _waveform = waveform;
//     });
//   }

//   void _playPauseAudio() async {
//     if (_isPlaying) {
//       await _player.pausePlayer();
//     } else {
//       await _player.startPlayer(
//         fromURI: 'your_audio_file_path',
//         whenFinished: () {
//           setState(() {
//             _isPlaying = false;
//             _currentPosition = 0.0;
//           });
//         },
        
//         // onProgress: (progress) {
//         //   setState(() {
//         //     _currentPosition = progress.position.inMilliseconds.toDouble();
//         //   });
//         // },
//       );
//     }
//     setState(() {
//       _isPlaying = !_isPlaying;
//     });
//   }

//   @override
//   void dispose() {
//     _player.closePlayer();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('Audio Waveform'),
//       ),
//       body: Column(
//         children: [
//           if (_waveform.isNotEmpty)
//             CustomPaint(
//               size: Size(double.infinity, 200),
//               painter: WaveformPainter(_waveform, _currentPosition),
//             ),
//           IconButton(
//             icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
//             onPressed: _playPauseAudio,
//           ),
//         ],
//       ),
//     );
//   }
// }

// class WaveformPainter extends CustomPainter {
//   final List<double> waveform;
//   final double currentPosition;

//   WaveformPainter(this.waveform, this.currentPosition);

//   @override
//   void paint(Canvas canvas, Size size) {
//     Paint paint = Paint()
//       ..color = Colors.blue
//       ..strokeWidth = 2.0;

//     Paint playedPaint = Paint()
//       ..color = Colors.red
//       ..strokeWidth = 2.0;

//     double width = size.width;
//     double height = size.height;
//     double middle = height / 2;
//     double scaleX = width / waveform.length;

//     for (int i = 0; i < waveform.length; i++) {
//       double x = i * scaleX;
//       double y = waveform[i] * middle;
//       if (i < currentPosition / 1000 * waveform.length) {
//         canvas.drawLine(Offset(x, middle - y), Offset(x, middle + y), playedPaint);
//       } else {
//         canvas.drawLine(Offset(x, middle - y), Offset(x, middle + y), paint);
//       }
//     }
//   }

//   @override
//   bool shouldRepaint(covariant CustomPainter oldDelegate) {
//     return true;
//   }
// }