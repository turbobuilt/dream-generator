import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';

showLowQualityImagesModal(BuildContext context) {
  return showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('Quality Constrained Images'),
        content: const Text(
            'On the free version, images are constrained and won\'t be very good quality... but we\'re working on making the free version better.  Please don\'t give us bad reviews based on the free stuff, because it\'s the best we can do right now without funding.'),
        actions: <Widget>[
          TextButton(
            child: const Text('OK'),
            onPressed: () {
              router.pop();
            },
          ),
        ],
      );
    },
  );
}