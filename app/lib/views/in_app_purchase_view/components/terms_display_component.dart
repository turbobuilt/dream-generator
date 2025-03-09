import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';

class TermsDisplayComponent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        TextButton(
          onPressed: () => router.push("/simple-terms"),
          child: const Text("Terms", style: TextStyle(fontSize: 14, fontWeight: FontWeight.normal, color: Colors.grey)),
        ),
        TextButton(
          onPressed: () => router.push("/simple-privacy"),
          child: const Text("Privacy", style: TextStyle(fontSize: 14, fontWeight: FontWeight.normal, color: Colors.grey)),
        ),
      ],
    );
  }
}
