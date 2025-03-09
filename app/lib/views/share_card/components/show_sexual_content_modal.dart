

import 'package:dev/main.dart';
import 'package:flutter/material.dart';

showSexualContentModal(BuildContext context, share) {
  return showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('Sexual Content'),
        content: const Text('This post may contain sexual content. Are you sure you want to view it?'),
        actions: <Widget>[
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(false);
            },
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(true);
            },
            child: const Text('Yes'),
          ),
          // TextButton(
          //   onPressed: () {
          //     globalStore.showSexualContent = true;
          //     Navigator.of(context).pop(true);
          //   },
          //   child: const Text('Yes To All'),
          // ),

        ],
      );
    },
  );
}