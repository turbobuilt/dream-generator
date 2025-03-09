// widget CachedImage wraps AvifImage.memory by calling CurrentImageData.load(url) and passing the bytes to AvifImage.memory

import 'dart:typed_data';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:flutter/cupertino.dart';
import '../models/CurrentImageData.dart';
import '../models/NetworkAsset.dart';

class CachedImage extends StatelessWidget {
  String url;
  double? defaultWidth;
  double? defaultHeight;
  CachedImage(this.url, {this.defaultWidth, this.defaultHeight});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<NetworkAsset?>(
      future: NetworkAsset.load(url),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          print("error: ${snapshot.error}");
          return Container();
        }
        final hasData = snapshot.hasData && snapshot.data != null;
        final networkAsset = snapshot.data;

        Widget? child;
        if (networkAsset?.error.isNotEmpty == true) {
          print("error getting image: ${networkAsset?.error}");
          child = const Center(child: Text("Error loading image please contact support@dreamgenerator.ai if you phone is online and you think this is a problem. Please include a screenshot."));
        } else if (networkAsset?.data != null) {
          child = AvifImage.memory(networkAsset!.data!);
        } else {
          child = const Center(child: CupertinoActivityIndicator());
        }

        // return LayoutBuilder(builder: (context, constraints) {
          return SizedBox(
            height: defaultHeight,
            width: defaultWidth,
            child: AnimatedOpacity(
              opacity: hasData ? 1 : 0,
              duration: const Duration(seconds: 1),
              curve: Curves.easeOut,
              child: child
            ),
          );
        // });
      },
    );
  }
}
