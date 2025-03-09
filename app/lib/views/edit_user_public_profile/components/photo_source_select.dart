import 'package:flutter/material.dart';


Future<String> showPhotoSourceSelectModal(BuildContext context) async {
  var result = await showModalBottomSheet(
    context: context,
    builder: (BuildContext context) {
      return PhotoSourceSelectModal();
    },
  );
  return result ?? "";
}
class PhotoSourceSelectModal extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.camera_alt),
            title: const Text('Take a photo'),
            onTap: () {
              Navigator.pop(context, 'camera');
            },
          ),
          ListTile(
            leading: const Icon(Icons.photo),
            title: const Text('Choose from gallery'),
            onTap: () {
              Navigator.pop(context, 'gallery');
            },
          ),
        ],
      ),
    );
  }
}