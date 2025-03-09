import 'package:dev/helpers/router.dart';
import 'package:dev/vars.dart';
import 'package:flutter/material.dart';

class CloseViewButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: ElevatedButton(
        style: ButtonStyle(backgroundColor: MaterialStateProperty.all(primaryBackground.withOpacity(.8))),
        onPressed: () {
          router.pop();
        },
        child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text("Close"), Spacer(), Icon(Icons.close, size: 20)]),
      ),
    );
  }
}
