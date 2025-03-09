import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';

class MainShareDisplay extends StatelessWidget {
  final Map<dynamic, dynamic> share;
  const MainShareDisplay({required this.share});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      if (share["imagePath"] == null) {
        return Container();
      }
      return AvifImage.network(
        "https://images.dreamgenerator.ai/${share["imagePath"]}",
        errorBuilder: (BuildContext context, Object exception, StackTrace? stackTrace) {
          return const Center(child: Text('😢'));
        },
        fit: BoxFit.cover,
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
      );
    });
  }
}
