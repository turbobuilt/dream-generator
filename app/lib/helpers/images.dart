import 'dart:io';
import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as path;

Future<void> saveImageToDocumentsDirectory(String url, String name, Function onComplete, Function onConvert, {Function? onProgress}) async {
  // get filename from url, or a random uuid.

  // var imageFileName = path.basename(url);
  var imageFileName = name;

  final directory = await getApplicationDocumentsDirectory();
  String dirPath = directory.path;
  var filePath = "$dirPath/images/$imageFileName";

  // create directory if not exists
  if (!await Directory("$dirPath/images").exists()) {
    await Directory("$dirPath/images").create(recursive: true);
  }

  // Prepend incrementing number to image file name if exists
  if (await File(filePath).exists()) {
    var fileName = path.basenameWithoutExtension(filePath);
    var fileExtension = path.extension(filePath);
    int fileNumber = 1;
    while (await File("$dirPath/images/${fileName}_$fileNumber$fileExtension").exists()) {
      fileNumber += 1;
    }
    imageFileName = "${fileName}_$fileNumber$fileExtension";
  }

  // var httpResponse = await http.get(Uri.parse(url));
  // make sure to do on progress
  var response = await Dio().get(
    url,
    onReceiveProgress: (int received, int total) {
      if (onProgress != null) onProgress(received / total * 100);
    },
    options: Options(responseType: ResponseType.bytes),
  );

  if (response.statusCode == 200) {
    print("saving image to $filePath");
    // await saveImage(httpResponse.bodyBytes, filePath);
    await saveImage(response.data, filePath);
    print('Image saved successfully at: $filePath');
    onComplete(filePath, null);

    // await Future.delayed(Duration(seconds: 2));

    // The following image conversion code requires specific platform-specific
    // packages or method which might not be available for Flutter/Dart.
    // Currently, Flutter/Dart does not support converting image formats natively.

    /* 
    try {
      var image = File(filePath);
      var heicData = await image.readAsBytes();
      var heicFilePath = filePath.replaceAll('.jpg', '.heic');
      await File(heicFilePath).writeAsBytes(heicData);
      print('Image saved successfully at: $heicFilePath');
      onConvert(heicFilePath, null);

      // Delete the original image
      image.deleteSync();
    } catch (e) {
      print(e);
      onComplete(null, e);
    }
    */
  } else {
    // The GET request failed. Handle the error.
    print('Failed to load image. HTTP status was ${response.statusCode}.');
    onComplete(null, 'Failed to load image. HTTP status was ${response.statusCode}.');
  }
}

Future<void> saveImage(Uint8List bytes, String path) async {
  final buffer = bytes.buffer;
  await File(path).writeAsBytes(buffer.asUint8List(bytes.offsetInBytes, bytes.lengthInBytes));
}

Future<List<String>> getImagesFromDirectory() async {
  // documents dir / images
  final documents = await getApplicationDocumentsDirectory();
  final Directory dir = Directory('${documents.path}/images');
  // if images doesn't exist create it
  if (!await dir.exists()) {
    await dir.create();
  }
  List<String> imagePaths = [];
  try {
    dir.listSync().forEach((file) {
      // make sure ends in jpg, jpeg, png, heic, webp, avif (lowercase)
      if (file.path.toLowerCase().endsWith('.jpg') ||
          file.path.toLowerCase().endsWith('.jpeg') ||
          file.path.toLowerCase().endsWith('.png') ||
          file.path.toLowerCase().endsWith('.heic') ||
          file.path.toLowerCase().endsWith('.webp') ||
          file.path.toLowerCase().endsWith('.avif')) {
        imagePaths.add(file.path);
      }
    });
    imagePaths.sort((a, b) {
      var aData = File(a).statSync();
      var bData = File(b).statSync();
      return bData.changed.compareTo(aData.changed);
    });
  } catch (e) {
    print(e.toString());
  }
  return imagePaths;
}
