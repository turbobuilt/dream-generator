import 'dart:io';

import 'package:dev/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
// import 'package:flutter_nude_detector/flutter_nude_detector.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

import '../helpers/network_helper.dart';
import '../models/CurrentImageData.dart';
import '../vars.dart';
import 'display_all_images_view.dart';

Future<dynamic> showReplyWithImageSelector(Map<String, dynamic> share, BuildContext mainContext) async {
  dynamic data;
  data = await showImageGrid(share, mainContext);
  if (mainContext.mounted) {
    // show toast
    ScaffoldMessenger.of(mainContext).showSnackBar(
      SnackBar(
        content: Text("Image Shared! Click on the the main image to see it."),
      ),
    );
  }

  // if (mainContext.mounted) {
  //   Navigator.pop(mainContext);
  // }
  return;
  // ignore: dead_code
  // try {
  //   await showModalBottomSheet(
  //     context: mainContext,
  //     builder: (localContext) {
  //       return LayoutBuilder(builder: (localContext, conststraints) {
  //         final textStyle = TextStyle(fontSize: 16, color: Colors.black);
  //         final buttonStyle = ButtonStyle(
  //           tapTargetSize: MaterialTapTargetSize.shrinkWrap,
  //           backgroundColor: MaterialStateProperty.all(Colors.white),
  //           textStyle: MaterialStateProperty.all(textStyle),
  //           // remove outline
  //           shape: MaterialStateProperty.all(const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.zero))),
  //           padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 2, 10, 2)),
  //           minimumSize: MaterialStateProperty.all(Size(conststraints.maxWidth, 41)),
  //         );
  //         const space = SizedBox(height: 8);
  //         return Container(
  //           padding: const EdgeInsets.all(16),
  //           child: Column(
  //             mainAxisSize: MainAxisSize.min,
  //             children: [
  //               ElevatedButton(
  //                 style: buttonStyle,
  //                 onPressed: () async {
  //                   try {
  //                     data = await showImageGrid(share, mainContext);
  //                     if (mainContext.mounted) {
  //                       Navigator.pop(mainContext);
  //                     }
  //                   } catch (e) {
  //                     print(e);
  //                   }
  //                 },
  //                 child: Row(
  //                   children: [
  //                     const Icon(Icons.image, color: Colors.black),
  //                     const SizedBox(width: 8),
  //                     Text('Pick from your images', style: textStyle),
  //                   ],
  //                 ),
  //               ),
  //               space,
  //               ElevatedButton(
  //                 style: buttonStyle,
  //                 onPressed: () {
  //                   // TODO: Implement Remix Prompt
  //                   if (mainContext.mounted) {
  //                     Navigator.pop(mainContext);
  //                   }
  //                 },
  //                 child: Row(
  //                   children: [
  //                     // const Icon(Icons.rotate_90_degrees_cw_outlined),
  //                     Text('Remix Prompt', style: textStyle),
  //                   ],
  //                 ),
  //               ),
  //               space,
  //               ElevatedButton(
  //                 style: buttonStyle,
  //                 onPressed: () {
  //                   // TODO: Implement Fresh Prompt
  //                   if (mainContext.mounted) {
  //                     Navigator.pop(mainContext);
  //                   }
  //                 },
  //                 child: Text('Fresh Prompt', style: textStyle),
  //               ),
  //               const SafeArea(child: SizedBox(height: 0), bottom: true),
  //             ],
  //           ),
  //         );
  //       });
  //     },
  //   );
  // } catch (e) {
  //   print(e);
  //   // show toast using defautl toast
  //   try {
  //     ScaffoldMessenger.of(mainContext).showSnackBar(
  //       SnackBar(
  //         content: Text("Error sharing images. Extra details, (please contact support@dreamgenerator.ai if this happens a lot): $e"),
  //       ),
  //     );
  //   } catch (e) {
  //     print(e);
  //   }
  // }
  // return data;
}

Future<dynamic> showImageGrid(Map<String, dynamic> share, BuildContext mainContext) async {
  var loadingPercent = null;
  var loadingText = "";

  const textStyle = TextStyle(fontSize: 16, color: Colors.black);

  await showCupertinoModalBottomSheet(
    context: mainContext,
    builder: (localContext) {
      return StatefulBuilder(builder: (localContext, update) {
        uploadImageStatusUpdate(int progressPercent, String activity) {
          update(() {
            loadingPercent = progressPercent;
            loadingText = activity;
          });
        }

        if (loadingPercent == null) {
          return SafeArea(
            bottom: true,
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
              ),
              itemCount: globalDisplayAllImagesViewStore.imagePaths.length,
              itemBuilder: (context, index) {
                final imageUrl = globalDisplayAllImagesViewStore.imagePaths[index];
                return GestureDetector(
                  onTap: () async {
                    await replyWithImage(imageUrl, share, uploadImageStatusUpdate);
                    if (mainContext.mounted) {
                      Navigator.pop(mainContext);
                    }
                  },
                  child: Image.asset(imageUrl),
                );
              },
            ),
          );
        } else {
          return SafeArea(
            bottom: true,
            child: Container(
              padding: const EdgeInsets.fromLTRB(10, 10, 10, 5),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 2),
                  Text(loadingText, style: textStyle),
                  const SizedBox(height: 20),
                  LinearProgressIndicator(
                    value: loadingPercent! / 100,
                    minHeight: 15,
                  ),
                  const SizedBox(height: 5),
                  Text("$loadingPercent%", style: textStyle),
                ],
              ),
            ),
          );
        }
      });
    },
  );
}

Future<void> replyWithImage(String imageUrl, Map<String, dynamic> share, Function(int, String) uploadImageStatusUpdate) async {
  uploadImageStatusUpdate(2, "Loading");
  final fileName = imageUrl.split('/').last;
  final imageData = await CurrentImageData.load(fileName);
  uploadImageStatusUpdate(4, "Checking Content");

  bool hasNudity = false;
  // bool hasNudity = await FlutterNudeDetector.detect(path: imageUrl);

  uploadImageStatusUpdate(8, "Compressing");
  final imageBytes = await File(imageUrl).readAsBytes();
  final avifBytes = await encodeAvif(imageBytes);

  Map<String, String> body = {
    "parent": share["id"].toString(),
    "text": imageData?.prompt ?? "",
    "model": imageData?.model ?? "",
    "imageSize": imageBytes.length.toString(),
    "nudity": hasNudity.toString(),
  };
  uploadImageStatusUpdate(15, "Uploading");
  final result = await postRequest("/api/share", body, imageData: avifBytes, onUploadProgress: (percent) => {
    uploadImageStatusUpdate(15 + (percent * .75).toInt(), "Uploading")
  });

  if (result.error?.isNotEmpty == true) {
    print("Error saving comment");
    print(result.error);
    throw result.error ?? "Error saving comment. Contact support@dreamgenerator.ai if it continues";
    // return "Error saving comment. Contact support@dreamgenerator.ai for help";
    // show error toast
  }
  uploadImageStatusUpdate(90, "Processing");

  final children = share["children"] as List<dynamic>;
  // append to front
  children.insert(0, result.result);

  return result.result;
}
