import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

// just a transparent background that expands to take up available space
class PopupMenuClickBackground extends StatelessWidget {
  final Function onTap;
  const PopupMenuClickBackground({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onTap();
      },
      child: SizedBox.expand(
        child: Container(
          color: Color.fromARGB(92, 0, 0, 0),
        ),
      )
    );
  }
}