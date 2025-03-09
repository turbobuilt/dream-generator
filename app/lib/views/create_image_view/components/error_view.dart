import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:flutter/material.dart';

class ErrorView extends StatelessWidget {
  final CreateImageView parent;
  final CreateImageViewState parentState;
  
  const ErrorView(this.parent, this.parentState);

  @override
  Widget build(BuildContext context) {
    if (parent.createImageViewData.error != "")
      return ConstrainedBox(
        constraints: BoxConstraints.loose(Size(MediaQuery.of(context).size.width, 200)),
        child: ListView(
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          children: [
            Container(
                padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
                child: Text(parent.createImageViewData.error, style: const TextStyle(color: Colors.red))),
          ],
        ),
      );
    return const SizedBox(height: 0, width: 0);
  }
}
