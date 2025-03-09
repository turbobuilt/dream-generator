import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';

class UserPublicProfileMainImage extends StatelessWidget {
  final Map<String, dynamic> profile;
  const UserPublicProfileMainImage({required this.profile});

  @override
  Widget build(BuildContext context) {
    // if (profile['picture'] == null) {
    //   return Container();
    // }
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.grey,
              width: 4,
            ),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              return profile['picture'] == null
                ? Center(child: Icon(Icons.person, size: constraints.maxWidth, color: Colors.grey.shade400))
                : ClipOval(child: AvifImage.network("https://images.dreamgenerator.ai/profile-pictures/${profile['picture']}", fit: BoxFit.cover));
            },
          ),
        );
      }
    );
  }
}
