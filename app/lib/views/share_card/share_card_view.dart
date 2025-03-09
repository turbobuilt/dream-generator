// ignore_for_file: use_build_context_synchronously

import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/display_output_audio_view/components/audio_display.dart';
import 'package:dev/views/feed_view/audio_player.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/reply_with_image.dart';
import 'package:dev/views/share_card/components/info_bar.dart';
import 'package:dev/views/share_card/components/components/like_bar.dart';
import 'package:dev/views/share_card/components/share_card_view_data.dart';
import 'package:dev/views/share_card/components/user_name_bar.dart';
import 'package:dev/views/share_view/share_view.dart';
import 'package:dev/views/top_bar_view.dart';
import 'package:dev/widgets/LikeButton.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../helpers/network_helper.dart';
import '../../vars.dart';
import '../create_image_view/create_image_view.dart';
import '../main_view/components/main_tab_bar.dart';
import '../main_view/main_view.dart';
import 'package:gamma_smart_pagination/gamma_smart_pagination.dart';

import '../share_view/components/share_children_component/share_children_component.dart';
import 'components/add_comment_component.dart';
import 'components/main_image_display.dart';


class ShareCardView extends StatelessWidget {
  late ShareCardViewData data;

  ShareCardView(this.data);

  @override
  Widget build(BuildContext context) {
    data.context = context;

    WidgetsBinding.instance!.addPostFrameCallback((_) {
      //check if not mounted
      if (!context.mounted) {
        return;
      }

      final bounds = context.findRenderObject()?.paintBounds;
      if (bounds != null) {
        data.share["height"] = bounds.height;
      }
    });

    return ChangeNotifierProvider.value(
      key: ValueKey(data.share["id"]),
      value: data,
      child: Consumer<ShareCardViewData>(
        builder: (context, data, child) {
          return Card(
            child: LayoutBuilder(builder: (context, constraints) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (data.share["imagePath"] != null) MainImageDisplay(data, constraints),
                  if (data.share["audioPath"] != null) ...{
                    AudioPlayerWidget(audioUrl: "https://images.dreamgenerator.ai/${data.share["audioPath"]}"),
                    Text(data.share["text"] ?? ""),
                  },
                  // InfoBar(data),
                  Divider(height: 2, thickness: 2, color: Colors.grey[300]),
                  UserNameBar(share: data.share),
                  LikeBar(data),
                  ShareChildrenComponent(data.share, false),
                  const SizedBox(height: 0),
                  AddCommentComponent(data, tapOutsideOverlayState),
                ],
              );
            }),
          );
        },
      ),
    );
  }
}
