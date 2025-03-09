import 'package:dev/widgets/large_app_bar.dart';
import 'package:dev/widgets/small_app_bar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_avif/flutter_avif.dart';

class CompareImageQuality extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Material(
      child: Column(
        children: [
          // SmallAppBar(title: "Quality Contrast"),
          LargeAppBar(title: "See The Difference"),
          Container(
            // color: Colors.purple,
            padding: const EdgeInsets.all(8.0),
            child: const Text(
              "You can see the quality difference when you upgrade.",
              style: TextStyle(color: Colors.black, fontWeight: FontWeight.normal, fontSize: 14),
            ),
          ),
          // const Text("This is the prompt: "),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.blue,
              borderRadius: BorderRadius.circular(5),
            ),
            child: const Text(
              "a giant orangutang in the trees of borneo",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(0),
              children: [
                Container(
                  padding: const EdgeInsets.all(8.0),
                  // color: Colors.purple,
                  child: const Center(
                    child: Text(
                      "Free Version",
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
                AvifImage.asset("assets/compare_image_quality/orangutang-sdxl-lightning.avif"),
                Container(
                  padding: const EdgeInsets.all(8.0),
                  // color: Colors.purple,
                  child: const Center(
                    child: Text(
                      "High Quality Version (Upgrade)",
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
                AvifImage.asset("assets/compare_image_quality/orangutang-dalle.avif"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
