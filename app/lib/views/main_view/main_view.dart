import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/ads.dart';
import 'package:dev/main.dart';
import 'package:dev/views/account_view.dart';
import 'package:dev/views/ai_chat_view/ai_chat_view.dart';
import 'package:dev/views/animate_video/animate_video_view.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/display_all_images_view.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:dev/views/generate_audio/generate_audio_view.dart';
import 'package:dev/views/in_app_purchase_view/in_app_purchase_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/modify_image_view.dart';
import 'package:dev/views/my_likes.dart';
import 'package:dev/views/notifications_view/notifications_view.dart';
import 'package:dev/views/people_view/people_view.dart';
import 'package:dev/views/remove_background/remove_background_view.dart';
import 'package:dev/views/top_bar_view.dart';
import 'package:dev/views/upscale/upscale_view.dart';
import 'package:dev/widgets/credits_row.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../edit_user_public_profile/edit_user_public_profile.dart';
import 'components/main_tab_bar.dart';

MainViewState mainViewState = MainViewState();

class MainView extends StatefulWidget {
  MainView() {
    print("constructing");
  }
  
  @override
  // ignore: no_logic_in_create_state
  MainViewState createState() {
    mainViewState = MainViewState();
    return mainViewState;
  }
}

class TapOutsideOverlayState extends ChangeNotifier {
  bool showing = false;

  void toggle() {
    showing = !showing;
    notifyListeners();
  }

  void show() {
    showing = true;
    notifyListeners();
  }

  void hide() {
    showing = false;
    notifyListeners();
  }
}

final tapOutsideOverlayState = TapOutsideOverlayState();

class MainViewState extends BetterState<MainView> {
  late BuildContext buildContext;

  @override
  void initState() {
    super.initState();
    AdManager.initAds();
  }

  @override
  Widget build(BuildContext context) {
    if (globalAuthenticatedUser.id == null || globalAuthenticatedUser.id == 0) {
      return const Center(child: CircularProgressIndicator());
    }
    buildContext = context;
    return Scaffold(
      body: SizedBox(
        height: MediaQuery.of(context).size.height,
        child: LayoutBuilder(builder: (context, constraints) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TopBarView(),
              Expanded(
                child: Stack(
                  children: [
                    FeedView(),
                    Container(
                      color: Colors.white,
                      child: Column(
                        children: <Widget>[
                          if (customTabBarState.tab == menuItems[Views.createImageView] || customTabBarState.tab == menuItems[Views.editImageView] || customTabBarState.tab == menuItems[Views.myLikesView])
                            Expanded(
                              child: Stack(children: [
                                Column(children: [
                                  CreditsRow(),
                                  Expanded(child: DisplayAllImagesView()),
                                ]),
                                ChangeNotifierProvider.value(
                                  value: tapOutsideOverlayState,
                                  child: Consumer<TapOutsideOverlayState>(
                                    builder: (context, tapOutsideOverlayState, child) {
                                      if (tapOutsideOverlayState.showing) {
                                        return SizedBox(
                                          child: GestureDetector(
                                            child: Container(color: Colors.transparent),
                                            onTap: () {
                                              print("tapped outside");
                                              tapOutsideOverlayState.hide();
                                            },
                                          ),
                                        );
                                      } else {
                                        return const SizedBox(height: 0);
                                      }
                                    },
                                  ),
                                ),
                              ]),
                            ),
                        ],
                      ),
                    ),
                    // if (customTabBarState.tab == menuItems[Views.profile])
                    //   EditUserPublicProfile()
                    if (customTabBarState.tab == menuItems[Views.purchasesView])
                      InAppPurchaseView()
                    else if (customTabBarState.tab == menuItems[Views.aiChatView])
                      AiChatView()
                    else if (customTabBarState.tab == menuItems[Views.myProfileView]!)
                      EditUserPublicProfile()
                    else if (customTabBarState.tab == menuItems[Views.upscaleView])
                      UpscaleImageView()
                    else if (customTabBarState.tab == menuItems[Views.removeBackgroundView])
                      RemoveImageBackgroundView()
                    else if (customTabBarState.tab == menuItems[Views.peopleView])
                      PeopleView()
                    else if (customTabBarState.tab == menuItems[Views.notificationsView])
                      NotificationsView()
                    else if (customTabBarState.tab == menuItems[Views.generateAudio])
                      GenerateAudioView()
                    else if (customTabBarState.tab == menuItems[Views.animateVideoView])
                      AnimateVideoView()
                  ],
                ),
              ),
              // MainMenu(),
              CustomTabBar()
            ],
          );
        }),
      ),
    );
  }
}
