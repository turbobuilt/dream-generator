import 'dart:ui';

import 'package:dev/vars.dart';
import 'package:dev/views/reply_with_image.dart';
import 'package:flutter/material.dart';

class ReplyWithImageButton extends StatelessWidget {
  dynamic data;

  ReplyWithImageButton(this.data);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ButtonStyle(
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        backgroundColor: MaterialStateProperty.all(primaryBackground),
        padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 2, 10, 2)),
        minimumSize: MaterialStateProperty.all(const Size(0, 29)),
      ),
      onPressed: () async {
        final newShare = await showReplyWithImageSelector(data.share, context);
        data.notifyListeners();
      },
      child: const Text("Reply With Image", style: TextStyle(fontSize: 13)),
    );
  }
}
