import 'package:flutter/material.dart';

class PrettyAppBar extends StatelessWidget {
  var title = "";
  PrettyAppBar({required this.title});

  @override
  Widget build(BuildContext context) {
    return Container(
      // background gradient left to right blue to purple
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.blue, Colors.purple],
        ),
      ),
      child: AppBar(title: Text(title)),
    );
  }
}
