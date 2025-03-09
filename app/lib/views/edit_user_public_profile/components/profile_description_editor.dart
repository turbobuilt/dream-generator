import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ProfileDescriptionEditor extends StatelessWidget {
  final TextEditingController controller =TextEditingController();

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: 5,
      minLines: 1,
      maxLengthEnforcement: MaxLengthEnforcement.enforced,
      decoration: const InputDecoration(
        labelText: 'Profile Description',
        hintText: 'Write a public description about yourself that people will see when they browser your shared photos',
      ),
    );
  }
}