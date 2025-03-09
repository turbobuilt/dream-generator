// this stateful widget shows the user profile in a round image with a 4px gray border it is 200px by 200px.  If you click on it, it prompts the system ui so the user can pick a photo/take one.  If you haven't selected one yet, it shows the camera icon in the circle instead of your face.

import 'dart:io';
import 'dart:typed_data';
import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:image_picker/image_picker.dart';

import '../../../helpers/resize_image.dart';
import 'photo_source_select.dart';

class UserImageEditor extends StatefulWidget {
  final Map<String, dynamic> profile;
  const UserImageEditor({required this.profile});

  @override
  UserImageEditorState createState() => UserImageEditorState();
}

postUserProfilePicture(Uint8List imageData, UserImageEditorState state) async {
  print("posting");
  var result = await postRequest("/api/post-user-profile-picture", <String, String>{}, imageData: imageData);
  if (result.error?.isNotEmpty == true) {
    state.error = result.error ?? "Error uploading image";
    state.update();
    return;
  }
  state.widget.profile['picture'] = result.result["picture"];
  state.update();
  return;
}

selectUserProfilePicture(BuildContext context, UserImageEditorState state) async {
  try {
    var source = await showPhotoSourceSelectModal(context);
    if (source == "") {
      return;
    }
    final picker = ImagePicker();
    final pickedFile =
        await picker.pickImage(source: source == "camera" ? ImageSource.camera : ImageSource.gallery, preferredCameraDevice: CameraDevice.front);
    if (pickedFile == null) {
      return;
    }
    state.uploading = true;
    state.update();
    var bytes = await FileImage(File(pickedFile.path)).file.readAsBytes();
    var resized = await resizeImageCover(bytes, 512, 512);
    await postUserProfilePicture(resized, state);
  } catch (e, stack) {
    state.error = e.toString();
    if (state.error == "") {
      state.error = "Error uploading image";
    }
    print(e);
    print(stack);
  } finally {
    state.uploading = false;
    state.update();
  }
}

class UserImageEditorState extends BetterState<UserImageEditor> {
  var uploading = false;
  var error = "";

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: () => selectUserProfilePicture(context, this),
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey, width: 4),
              ),
              child: uploading
                  ? const Center(child: CircularProgressIndicator())
                  : widget.profile['picture'] == null
                      ? const Center(child: Icon(Icons.camera_alt, size: 50, color: Colors.grey))
                      : ClipOval(
                          child:
                              AvifImage.network("https://images.dreamgenerator.ai/profile-pictures/${widget.profile['picture']}", fit: BoxFit.cover)),
            ),
          ),
          if (error.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(error, style: const TextStyle(color: Colors.red)),
            ),
        ],
      ),
    );
  }
}
