import 'package:dev/views/share_card/components/share_card_view_data.dart';
import 'package:flutter/material.dart';

var models = {
  "sdxl": { "label": "Normal" },
  "dalle3": { "label": "High Quality" },
  "sd-openjourney": { "label": "Low Quality" },
};

class InfoBar extends StatelessWidget {
  ShareCardViewData data;
  InfoBar(this.data);

  @override
  Widget build(BuildContext context) {
    print("model name is: ${data.share["model"]}"); // Print statement 1 (info_bar.dart)
    var modelName = models[data.share["model"]]?["label"] ?? "";
    return Container(
      color: const Color.fromARGB(124, 255, 255, 255),
      padding: const EdgeInsets.symmetric(horizontal: 1, vertical: 3),
      child: Row(
        children: [
          Expanded(child: Text(modelName, style: const TextStyle(fontSize: 16))),
        ],
      ),
    );
  }
}
