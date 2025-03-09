import 'dart:io';

import 'package:ffmpeg_kit_flutter_audio/return_code.dart';
import 'package:flutter_sound/flutter_sound.dart';
import 'package:path_provider/path_provider.dart';
import 'package:ffmpeg_kit_flutter_audio/ffmpeg_kit.dart';

convertToMp3(String inputPath) async {
  var tempDir = await getTemporaryDirectory();
  String outputPath = '${tempDir.path}/temp.mp3';

  // Check if the temp file exists and delete it
  File tempFile = File(outputPath);
  if (await tempFile.exists()) {
    await tempFile.delete();
  }

  var session = await FFmpegKit.execute("-i '$inputPath' -c:a libmp3lame $outputPath");
  final returnCode = await session.getReturnCode();

  if (ReturnCode.isSuccess(returnCode)) {
    // SUCCESS
  } else if (ReturnCode.isCancel(returnCode)) {
    // CANCEL
  } else {
    // ERROR
  }

  return outputPath;
}
