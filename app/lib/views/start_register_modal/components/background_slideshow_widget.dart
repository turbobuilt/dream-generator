import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_avif/flutter_avif.dart';

class BackgroundSlideshowWidget extends StatefulWidget {
  final List<String> imagePaths;
  const BackgroundSlideshowWidget({Key? key, required this.imagePaths}) : super(key: key);

  @override
  BackgroundSlideshowWidgetState createState() => BackgroundSlideshowWidgetState();
}

class BackgroundSlideshowWidgetState extends State<BackgroundSlideshowWidget> {
  AvifImage? currentBackgroundImage;
  var currentBackgroundImageIndex = -1;
  Timer? updateBackgroundImageTimer;

  updateBackgroundImageWidget() {
    currentBackgroundImageIndex = (currentBackgroundImageIndex + 1) % widget.imagePaths.length;
    currentBackgroundImage = AvifImage.asset(
      widget.imagePaths[currentBackgroundImageIndex],
      key: ValueKey(widget.imagePaths[currentBackgroundImageIndex]),
      fit: BoxFit.cover,
    );
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) {
        setState(() {});
      }
    });
  }


  @override
  void initState() {
    updateBackgroundImageWidget();
    updateBackgroundImageTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      updateBackgroundImageWidget();
    });
    super.initState();
  }

  @override
  void dispose() {
    updateBackgroundImageTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        child: SizedBox(
          key: ValueKey(widget.imagePaths[currentBackgroundImageIndex]),
          height: constraints.maxHeight,
          child: currentBackgroundImage,
        ),
      );
    });
  }
}
