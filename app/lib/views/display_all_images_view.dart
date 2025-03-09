import 'dart:io';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/images.dart';
import 'package:dev/main.dart';
import 'package:dev/views/create_image_view/components/create_image_view_data/components/nsfw_modal.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/upgrade_modal/upgrade_modal.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:provider/provider.dart';

import 'main_view/components/main_tab_bar.dart';

class DisplayAllImagesViewStore extends ChangeNotifier {
  String? imageUrl;
  bool showSheet = false;
  List<String> imagePaths = [];
  var imagesLoaded = false;

  DisplayAllImagesViewStore() {
    // loadImagePaths();
  }

  Future loadImagePaths() async {
    // in ui thread
    imagePaths = await getImagesFromDirectory();
    if (imagePaths.isEmpty) {
      createImageViewHistory.selectedStyle = 'None';
      createImageViewHistory.update();
    }
    imagesLoaded = true;
    notifyListeners();
  }
}

class DisplayAllImagesView extends StatefulWidget {
  @override
  DisplayAllImagesViewState createState() => DisplayAllImagesViewState();
}

class DisplayAllImagesViewState extends BetterState<DisplayAllImagesView> {
  // constructor, call load iamges
  DisplayAllImagesViewState() {
    globalDisplayAllImagesViewStore.loadImagePaths();
  }

  void imageTouched(String imagePath) async {
    await globalStore.setImage(imagePath);

    // ignore: use_build_context_synchronously
    showCupertinoModalBottomSheet(
        context: context,
        duration: const Duration(milliseconds: 300),
        expand: true,
        animationCurve: Curves.easeOut,
        builder: (context) => DisplayOutputView());
    print('image path is $imagePath Was image path');
    update(() {});
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: globalDisplayAllImagesViewStore,
      child: Consumer<DisplayAllImagesViewStore>(
        builder: (context, notifier, child) => Container(
          padding: const EdgeInsets.fromLTRB(2, 2, 2, 2),
          // background red
          // color: Colors.red,
          child: globalDisplayAllImagesViewStore.imagePaths.isEmpty
              ? ListView(
                  physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // const Text(
                          //   "Welcome to Dream Generator AI Art. Thanks for trying my latest app!  You will be amazed by the quality of the images.  Sometimes they aren't perfect, but they always entertain.  Have fun! You all are amazing.",
                          //   // "Welcome to Dream Generator AI. Enjoy making awesome Art and have fun chatting.",
                          //   textAlign: TextAlign.center,
                          //   style: TextStyle(fontSize: 15, height: 1.5),
                          // ),
                          // const SizedBox(height: 30),

                          // // rich text that says "please note that this app *DOES NOT create 'nsfw' images* and you will need to go to dreamgenerator.ai to do so."
                          // RichText(
                          //   text: const TextSpan(
                          //     text: 'Please note that this app ',
                          //     style: TextStyle(fontSize: 15, height: 1.5),
                          //     children: <TextSpan>[
                          //       TextSpan(
                          //         text: 'DOES NOT create "nsfw" images',
                          //         style: TextStyle(fontWeight: FontWeight.bold),
                          //       ),
                          //       TextSpan(
                          //         text: ' and you will need to go to dreamgenerator.ai to do so.',
                          //       ),
                          //     ],
                          //   ),
                          // ),

                          // Text("Welcome to Dream Generator. Enjoy making awesome art, or chatting in the next tab. Please note that \"NSFW\" content doesn't exist in the app.  Go dreamgenerator.ai if you need unfiltered stuff. This is Google Play policy.")

                          RichText(
                            text:  const TextSpan(
                              text: "Hi, and welcome to Dream Generator.",
                              style: TextStyle(
                                fontSize: 15,
                                height: 1.5,
                                color: Colors.black
                              )
                            )
                          ),
                          const SizedBox(height: 30),
                          RichText(
                            text:  const TextSpan(
                              text: "This app is fun and easy to use.",
                              style: TextStyle(
                                fontSize: 15,
                                height: 1.5,
                                color: Colors.black
                              )
                            )
                          ),
                          const SizedBox(height: 30),
                          const Text("The free version generates cool images..."),
                          const SizedBox(height: 30),
                          const Text("But for highest quality models, subscribe."),
                          const SizedBox(height: 30),
                          ElevatedButton(onPressed: () {
                            print("Working");
                            tryShowOutOfCreditsModal(context, true, force: true);
                            // tryShowOutOfCreditsModal(context, true);
                          }, child: const Text("Subscribe"))

                          // RichText(
                          //   textAlign: TextAlign.center,
                          //   text: TextSpan(
                          //     children: <TextSpan>[
                          //       const TextSpan(
                          //         text: "If you need NSFW, please go to ",
                          //       ),
                          //       TextSpan(
                          //         text: "dreamgenerator.ai",
                          //         style: const TextStyle(
                          //           color: Colors.blue,
                          //           decoration: TextDecoration.underline
                          //         ),
                          //         // open link
                          //         recognizer: TapGestureRecognizer()
                          //           ..onTap = () {
                          //             showOpenWebAppDialog(context, "", "");
                          //           },
                          //       ),
                          //       const TextSpan(
                          //         text: " as per Google Play policy."
                          //       )
                          //     ],
                          //     style: const TextStyle(
                          //       fontSize: 15,
                          //       height: 1.5,
                          //       color: Colors.black
                          //     )
                          //   )
                          // )

                          // RichText(
                          //     text: const TextSpan(
                          //   text:
                          //       "Welcome to Dream Generator. NSFW content cannot be produced in this app, please go to dreamgenerator.ai for the \"Wild West\" of AI.  This app is just about fun images as per Google Play policy. So have fun!",
                          //   style: TextStyle(fontSize: 15, height: 1.5, color: Colors.black),
                          // )),

                          // Text(
                          //   // "Welcome to Dream Generator AI Art. Thanks for trying my latest app!  You will be amazed by the quality of the images.  Sometimes they aren't perfect, but they always entertain.  Have fun! You all are amazing.",
                          //   "Please ",
                          //   textAlign: TextAlign.center,
                          //   style: TextStyle(fontSize: 15, height: 1.5),
                          // ),
                          // SizedBox(height: 30),
                          // Text(
                          //   'To get started, type a prompt below.',
                          //   textAlign: TextAlign.center,
                          //   style: TextStyle(fontSize: 15, height: 1.5),
                          // ),
                          // SizedBox(height: 30),
                          // Text(
                          //   "Then you can see what others have made in the 'feed' view!  Once you make an image you can click 'Publish' and start getting likes!",
                          //   textAlign: TextAlign.center,
                          //   style: TextStyle(fontSize: 15, height: 1.5),
                          // ),
                          // SizedBox(height: 30),
                          // Text(
                          //   "If you run out of credits, no problem, just go to the feed and like some people's stuff and you can get more credits! Also you can share the app with friends to get free credits too!",
                          //   textAlign: TextAlign.center,
                          //   style: TextStyle(fontSize: 15, height: 1.5),
                          // ),
                        ],
                      ),
                    ),
                  ],
                )
              : GridView.count(
                  physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                  crossAxisCount: 3,
                  padding: const EdgeInsets.all(0),
                  children: globalDisplayAllImagesViewStore.imagePaths.map(
                    (imagePath) {
                      return Padding(
                        padding: const EdgeInsets.all(2.0),
                        child: GestureDetector(
                          onTap: () => imageTouched(imagePath),
                          child: Image.file(
                            File(imagePath),
                            fit: BoxFit.cover,
                          ),
                        ),
                      );
                    },
                  ).toList(),
                ),
        ),
      ),
    );
  }
}
