// import 'package:appinio_social_share/appinio_social_share.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:flutter/material.dart';
import 'package:icons_plus/icons_plus.dart';
import 'package:social_share/social_share.dart';
import 'package:social_share_plugin/social_share_plugin.dart';


import '../main.dart';

class CreateShareView extends StatelessWidget {
  late final CurrentImageData? currentImageData;
  // AppinioSocialShare appinioSocialShare =  AppinioSocialShare();

  CreateShareView({this.currentImageData});

  get url {
    if (currentImageData?.mostRecentShare == null) {
      return null;
    }
    return "$website/share/${currentImageData?.mostRecentShare}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Container(
            // background gradient left to right blue to purple
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Colors.blue, Colors.purple],
              ),
            ),
            child: AppBar(title: const Text('Share')),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                ElevatedButton(
                  onPressed: () {
                    SocialShare.shareOptions("", imagePath: globalStore.localImageUrl);
                  },
                  child: const Row(children: [Text("Share"), Spacer(), Icon(FontAwesome.message)]),
                ),
                const SizedBox(height: 10),

                ElevatedButton(
                  onPressed: () async  {
                    await shareToFeedFacebook(path: globalStore.imageUrl);
                  },
                  child: const Row(children: [Text("Facebook"), Spacer(), Icon(FontAwesome.facebook_brand)]),
                ),
                const SizedBox(height: 10),
                if (url != null)
                  ElevatedButton(
                    onPressed: () => {SocialShare.shareTwitter("dreamgenerator.ai", url: url)},
                    child: const Row(children: [Text("Twitter / X"), Spacer(), Icon(FontAwesome.twitter_brand)]),
                  ),
                const SizedBox(height: 10),
                // ElevatedButton(
                //   onPressed: () {
                //     SocialShare.shareSms("dreamgenerator.ai", url: url);
                //   },
                //   child: const Row(children: [Text("SMS"), Spacer(), Icon(FontAwesome.message)]),
                // ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: () async {
                    await shareToFeedInstagram(path: globalStore.imageUrl);
                  },
                  child: const Row(children: [Text("Instagram"), Spacer(), Icon(FontAwesome.instagram_brand)]),
                ),
                const SafeArea(child: SizedBox(height: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
