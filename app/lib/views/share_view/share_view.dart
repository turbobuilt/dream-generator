import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/share_view/components/main_share_display.dart';
import 'package:dev/views/share_view/components/share_view_bottom_bar.dart';
import 'package:dev/views/share_view/components/user_info_display.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:provider/provider.dart';
import '../../vars.dart';
import '../create_image_view/components/create_image_view_data/create_image_view_data.dart';
import 'components/share_children_component/share_children_component.dart';

class ShareView extends StatelessWidget with ChangeNotifier {
  var share = {};
  final createImageViewData = CreateImageViewData();

  ShareView(info) {
    share["id"] = info["id"];
    share = info;
  }

  @override
  Widget build(BuildContext context) {
    context = context;

    return ChangeNotifierProvider.value(
      value: this,
      child: Consumer<ShareView>(
        builder: (context, data, child) {
          return Scaffold(
            body: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  // background gradient left to right blue to purple
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.blue, primaryBackground],
                    ),
                  ),
                  child: AppBar(title: const Text('Replies')),
                ),
                Expanded(
                  child: ListView(
                    shrinkWrap: true,
                    padding: const EdgeInsets.all(0),
                    physics: const BouncingScrollPhysics(),
                    children: [
                      MainShareDisplay(share: share),
                      const SizedBox(height: 10),
                      UserInfoDisplay(share: share),
                      const SizedBox(height: 10),
                      ShareChildrenComponent(share, true),
                      ShareViewBottomBar(share: share),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
