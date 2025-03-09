import 'package:flutter/material.dart';

class FeatureComponent extends StatelessWidget {
  String description;
  FeatureComponent(this.description);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(Icons.check, color: Color.fromARGB(255, 100, 213, 75)),
          const SizedBox(width: 7),
          Text(description, style: const TextStyle()),
        ],
      ),
    );
  }
}
