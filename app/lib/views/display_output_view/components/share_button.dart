import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/vars.dart';
import 'package:dev/views/display_output_view/components/image_loader.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

class ShareButton extends StatelessWidget {
  DisplayOutputViewState parentState;
  
  ShareButton(this.parentState);

  startShowShare() async {
    print("Starting to show share");
    // globalAuthenticatedUser.autoPublish = 0;
    // globalAuthenticatedUser.userName = null;
    // var text = 'Try making images with Dream Generator.\nHere\'s what I wrote:\n\n${globalStore.currentImageData?.prompt ?? "Whoops - no prompt!"}\nWhat can you do?';
    final box = parentState.context.findRenderObject() as RenderBox?;
    var text =
        // "I created this image by entering the following prompt into DreamGenerator.ai:\n\n${globalStore.currentImageData?.prompt ?? 'whoops - no prompt'}\n\nTry at dreamgenerator.ai if you want to see what you can do.";
        "Dream Generator is a cool art application.  I typed this in \"${globalStore.currentImageData?.prompt ?? ''}\" and look what I got!\n\nTry yourself: https://dreamgenerator.ai";
    final result = await Share.shareXFiles(
      [
        XFile(
          parentState.imageLoader.localImageUrl!,
          name: 'image.png',
          mimeType: 'image/png',
        )
      ],
      text: text,
      // 'This is what Dream Generator came up with when I wrote: "${globalStore.currentImageData?.prompt ?? 'Whoops - no prompt!'}". Download at https://dreamgenerator.ai or try in the browser and see how many likes you can get!',
      sharePositionOrigin: box!.localToGlobal(Offset.zero) & box.size,
    );

    // 'This is what Dream Generator came up with when I wrote: "${globalStore.currentImageData?.prompt ?? 'Whoops - no prompt!'}". Download at https://dreamgenerator.ai or try in the browser and see how many likes you can get!'

    if (result.status == ShareResultStatus.success) {
      print('Thank you for sharing the picture!');
    } else {
      print("error");
    }

    return;

    // ignore: dead_code
    if (globalAuthenticatedUser.autoPublish == 0 && parentState.context.mounted) {
      showDialog(
        context: parentState.context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text("Auto Share?"),
            content: Column(mainAxisSize: MainAxisSize.min, children: [
              const Text(
                  "Do you want to automatically share with the community when you share to Facebook or other sites? This allows you to get likes on this platform and inspire others! Thanks for your support, I love making this app, and your sharing makes the world a better place!"),
              const SizedBox(height: 15),
              ElevatedButton(
                style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(primaryBackground), foregroundColor: MaterialStateProperty.all(Colors.white)),
                onPressed: () {
                  parentState.updateAutoPublish(1);
                  router.pop();
                  parentState.showShare();
                },
                child: const Text("Ok!"),
              ),
              const SizedBox(height: 25),
              TextButton(
                onPressed: () {
                  parentState.updateAutoPublish(-1);
                  router.pop();
                  parentState.showShare();
                },
                child: const Text("Do not auto share with community"),
              ),
            ]),
          );
        },
      );
      return;
    } else {
      print("ELSE");
      parentState.showShare();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: startShowShare,
      style: parentState.buttonStyle,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.share, size: parentState.iconSize),
          // Text("", style: TextStyle(fontSize: iconSize)),
          const SizedBox(height: 5),
          const Text("Share"),
        ],
      ),
    );
  }
}
