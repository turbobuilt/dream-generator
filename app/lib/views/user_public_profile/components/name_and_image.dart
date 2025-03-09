import 'package:dev/views/user_public_profile/components/add_friend_button.dart';
import 'package:dev/views/user_public_profile/components/message_friend_button.dart';
import 'package:dev/views/user_public_profile/components/video_call/start_video_call.dart';
import 'package:flutter/material.dart';

import 'user_public_profile_main_image.dart';

const double maxHeight = 150;
const double minHeight = 120;
const maxDeltaHeight = maxHeight - minHeight;

class NameAndImage extends StatelessWidget {
  final dynamic profile;
  Function onUpdate;
  NameAndImage({required this.profile, required this.onUpdate});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // var deltaHeight = constraints.maxHeight - minHeight;
        // var percent = (deltaHeight / maxDeltaHeight).clamp(0.0, 1.0);
        return Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 0), // vertical: 5 + (10 * percent).roundToDouble()
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              UserPublicProfileMainImage(profile: profile),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(profile["userName"] ?? "No Name",
                        style: const TextStyle(fontSize: 18, color: Colors.black, decoration: TextDecoration.none)),
                    if (profile["isFriend"] == true) ...{
                      // message button
                      MessageFriend(profile: profile),
                      StartVideoCall(profile),
                    } else
                      AddFriendButton(profile: profile, onUpdate: () => onUpdate())
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }
}

class HeaderContent extends SliverPersistentHeaderDelegate {
  final Widget child;

  HeaderContent({required this.child});

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return child;
  }

  @override
  double get maxExtent => maxHeight;

  @override
  double get minExtent => minHeight;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return true;
  }
}
