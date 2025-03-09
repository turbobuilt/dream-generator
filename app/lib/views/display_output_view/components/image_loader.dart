// converted to Flutter
import 'dart:io';

import 'package:dev/helpers/images.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';

class ImageLoader {
  String? localImageUrl;
  FileImage? image;
  String? error;
  String? saveMessage;
  var saving = false;
  BuildContext? presentationMode;

  Future<void> getLikeStatus() async {
    if (globalStore.currentImageData?.promptId != null && globalStore.currentImageData?.promptId != 0) {
      final status = await postRequest("/api/prompt/prompt-info", {"promptId": globalStore.currentImageData?.promptId});
      if (status.error != null) {
        print("error getting like status");
        print(status.error);
        return;
      }
      print(status.result);
      if (status.result["isOwnPrompt"] == true) {
        globalStore.currentImageData?.isOwnPrompt = true;
      }
      if (status.result["isLiked"] == true) {
        globalStore.currentImageData?.liked = true;
      }
      globalStore.currentImageData?.save();
    }
  }

  Future<void> getImage(String imageUrl, DisplayOutputViewState state) async {
    getLikeStatus().then((value) {
      state.safeSetState(() {});
    });
    if (imageUrl.startsWith("http")) {
      state.downloadProgress = 0;
      await saveImageToDocumentsDirectory(
        imageUrl,
        globalStore.currentImageData!.name,
        (localUrl, error) async {
          if (localUrl != null) {
            print("image saved");
            globalStore.currentImageData!.save();
            // try {
            //   // start performance timer
            //   final stopwatch = Stopwatch()..start();
            //   final hasNudity = await FlutterNudeDetector.detect(path: localUrl);
            //   print("has nudity: $hasNudity");
            //   stopwatch.stop();
            //   final elapsedSeconds = stopwatch.elapsedMilliseconds / 1000;
            //   print('Nude detection took $elapsedSeconds');
            // } catch (err) {
            //   print("error detecting nudity $err");
            // }

            setLocalImageUrl(localUrl);
            if (state.mounted) {
              state.update(() {});
            }
          } else if (error != null) {
            print("error");
            print(error);
          }
        },
        (localUrl, error) {
          setLocalImageUrl(localUrl);
        },
        onProgress: (double percentComplete) {
          state.safeSetState(() {
            state.downloadProgress = percentComplete;
          });
        },
      );
    } else {
      setLocalImageUrl(imageUrl);
      checkShareStatus();
    }
    // showPushNotificationPopup();
  }

  checkShareStatus() async {
    if (globalStore.currentImageData?.mostRecentShare != null) {
      print("most recent share is ${globalStore.currentImageData?.mostRecentShare}");
      try {
        var result = await getRequest("/api/get-check-if-share-exists?id=${globalStore.currentImageData?.mostRecentShare}");
        if (result.result["exists"] == false) {
          print("share does not exist");
          globalStore.currentImageData?.mostRecentShare = null;
          globalStore.currentImageData?.promptId = null;
          globalStore.currentImageData?.save();
        } else {
          print("share exists");
        }
      } catch (err) {
        print("error checking share status");
        print(err);
      }
      // showPushNotificationPopup();
    } else {
      globalStore.currentImageData?.mostRecentShare = null;
      globalStore.currentImageData?.promptId = null;
      globalStore.currentImageData?.save();
    }
  }

  void setLocalImageUrl(String localUrl) {
    globalStore.localImageUrl = localUrl;
    localImageUrl = localUrl;
    image = FileImage(File(localImageUrl!));
    globalDisplayAllImagesViewStore.loadImagePaths();
  }

  Future<void> saveToPhotos(presentationMode) async {
    saving = true;
    this.presentationMode = presentationMode;
    if (localImageUrl != null) {
      await ImageGallerySaver.saveFile(localImageUrl!).then((value) {
        saveCompleted(value, null, null);
        Fluttertoast.showToast(
          msg: "Image Saved!",
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.BOTTOM,
          timeInSecForIosWeb: 4,
        );
      }).catchError((error) {
        saveCompleted(null, error, null);
      });
    }
  }

  void saveCompleted(image, error, contextInfo) {
    saving = false;
    if (error != null) {
      print("error");
      print(error);
      this.error = "Error: $error";
    } else {
      // Image saved successfully
      print("image saved");
      saveMessage = "Saved!";
      // close after 3 seconds
      // Future.delayed(Duration(seconds: 3), () {
      //   router.
      // });
    }
  }
}
