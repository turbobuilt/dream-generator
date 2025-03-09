import 'package:fast_image_resizer/fast_image_resizer.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:image_size_getter/image_size_getter.dart' as image_size_getter;
import 'package:image/image.dart';

Future<Uint8List> resizeImageCover(Uint8List data, int width, int height) async {
  final memoryImageSize = image_size_getter.ImageSizeGetter.getSize(image_size_getter.MemoryInput(data));
  var rawWidth = memoryImageSize.width;
  var rawHeight = memoryImageSize.height;

  // get intermediate width and height so that it covers the target width and height
  var targetWidth = width;
  var targetHeight = (targetWidth * rawHeight / rawWidth).round();
  if (targetHeight < height) {
    targetHeight = height;
    targetWidth = (targetHeight * rawWidth / rawHeight).round();
  }
  var bytes = await resizeImage(data, width: targetWidth, height: targetHeight);

  // now crop the image to the target width and height, centered
  var cropX = (targetWidth - width) ~/ 2;
  var cropY = (targetHeight - height) ~/ 2;
  var img = decodeImage(bytes!.buffer.asUint8List());
  var cropped = copyCrop(img!, x: cropX, y: cropY, width: width, height: height );
  var croppedBytes = encodePng(cropped);

  return Uint8List.fromList(await encodeAvif(croppedBytes));

}