import 'package:dev/vars.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/reply_with_image.dart';
import 'package:dev/views/share_card/components/components/components/add_friend_feed_button.dart';
import 'package:dev/views/share_card/components/components/components/recreate_button.dart';
import 'package:dev/views/share_card/components/components/components/reply_with_image_button.dart';
import 'package:dev/views/share_card/components/share_card_view_data.dart';
import 'package:dev/widgets/LikeButton.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LikeBar extends StatelessWidget {
  ShareCardViewData data;

  LikeBar(this.data);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        LikeButton(data.share, () => data.like(data.share), () => data.unlike(data.share)),
        const SizedBox(width: 10),
        Text("+${data.share["likesCount"]}"),
        const Spacer(),
        AddFriendFeedButton(data),
        // ReplyWithImageButton(data),
        // const SizedBox(width: 4),
        // RecreateButton(data)
      ],
    );
  }
}
