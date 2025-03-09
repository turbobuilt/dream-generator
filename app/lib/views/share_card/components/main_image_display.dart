import 'dart:ui';

import 'package:dev/main.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/share_card/components/info_bar.dart';
import 'package:dev/views/share_card/components/share_card_view_data.dart';
import 'package:dev/views/share_card/components/show_sexual_content_modal.dart';
import 'package:dev/views/share_card/share_card_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_avif/flutter_avif.dart';

import '../../../helpers/router.dart';

class MainImageDisplay extends StatelessWidget {
  ShareCardViewData data;
  BoxConstraints constraints;
  MainImageDisplay(this.data, this.constraints);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        if (data.share["sexualContent"] == 1) {
          var result = await showSexualContentModal(context, data.share);
          if (result) {
            data.share["sexualContent"] = 0;
          }
          mainViewState.update();
          return;
        }
        router.pushNamed("shareView", extra: data.share, pathParameters: {"id": data.share["id"].toString()});
      },
      child: Stack(
        children: [
          ClipRect(
            child: ImageFiltered(
              imageFilter: data.share["sexualContent"] == 1 && !globalStore.showSexualContent
                  ? ImageFilter.blur(sigmaX: 20, sigmaY: 20)
                  : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
              child: AvifImage.network(
                "https://images.dreamgenerator.ai/${data.share["imagePath"]}",
                fit: BoxFit.cover,
                colorBlendMode: BlendMode.darken,
                errorBuilder: (BuildContext context, Object exception, StackTrace? stackTrace) {
                  return const Center(
                      child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 15, horizontal: 10),
                    child: Column(
                      children: [Text("😢"), SizedBox(height: 10), Text("Image couldn't be loaded")],
                    ),
                  ));
                },
                frameBuilder: (BuildContext context, Widget child, int? frame, bool wasSynchronouslyLoaded) {
                  if (wasSynchronouslyLoaded) {
                    return child;
                  }
                  return SizedBox(
                    height: frame == null ? constraints.maxWidth : null,
                    width: constraints.maxWidth,
                    child: AnimatedOpacity(
                      opacity: frame == null ? 0 : 1,
                      duration: const Duration(seconds: 1),
                      curve: Curves.easeOut,
                      child: child,
                    ),
                  );
                },
              ),
            ),
          ),
          // Positioned(left: 0, right: 0, bottom: 0, child: InfoBar(data)),
        ],
      ),
    );
  }
}
