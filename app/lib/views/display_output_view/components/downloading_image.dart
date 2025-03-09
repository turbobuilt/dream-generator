import 'package:dev/main.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class DownloadingImage extends StatelessWidget {
  DisplayOutputViewState parentState;

  DownloadingImage(this.parentState);
  

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 100),
          const Text("Downloading Your Image!", style: TextStyle(fontSize: 18.0)),
          const SizedBox(height: 20),
          Center(child: Text("${parentState.downloadProgress.toStringAsFixed(0)}%", style: const TextStyle(fontSize: 17.0))),
          const SizedBox(height: 40),
          if (globalStore.currentImageData?.model == "sd-openjourney") ...{
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text("Lower quality images because you don't have any more credits", textAlign: TextAlign.center),
              ),
            ),
            const SizedBox(height: 20)
          },
          const CircularProgressIndicator(),
        ],
      ),
    );
  }
}
