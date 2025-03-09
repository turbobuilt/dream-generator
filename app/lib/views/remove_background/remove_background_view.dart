import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/ads.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/models/CurrentImageData.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/upgrade_modal/upgrade_modal.dart';
import 'package:dev/views/remove_background/remove_background_state.dart';
import 'package:dev/views/upscale/display_upscaled_image_view.dart';
import 'package:dev/widgets/credits_row.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_size_getter/image_size_getter.dart' as image_size_getter;
import 'package:dev/controllers/create_image_view_controller.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_size_getter/image_size_getter.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:fast_image_resizer/fast_image_resizer.dart';
import 'dart:math';

class HideImageStore extends ChangeNotifier {
  var hideImage = false;
  update() {
    notifyListeners();
  }
}

var hideImageStore = HideImageStore();

class RemoveImageBackgroundView extends SmartWidget<RemoveImageBackgroundViewStore> {
  RemoveImageBackgroundView() {
    state = removeBackgroundState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      padding: const EdgeInsets.all(0),
      color: Colors.white,
      child: Column(
        children: [
          CreditsRow(),
          Expanded(
            child: Column(
              children: [
                const Spacer(),
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("You can remove the background from an image using AI.", textAlign: TextAlign.center),
                      // SizedBox(height: 10),
                      // Text("You can increase the size by 2x or 4x.", textAlign: TextAlign.center),
                      SizedBox(height: 10),
                      Text("Pick your image and get started!", textAlign: TextAlign.center)
                    ],
                  ),
                ),
                const Spacer(),
                if (state.generating) ...{
                  const SizedBox(height: 50),
                  const Center(child: CircularProgressIndicator()),
                  const SizedBox(height: 30),
                  const Center(child: Text("Takes 15 to 20 seconds, but could be more or less.")),
                  // const SizedBox(height: 5),
                  // const Center(child: Text("If it takes a really long time... quit the app and try again!", textAlign: TextAlign.center)),
                  const SizedBox(height: 50),
                } else ...{
                  if (state.image == null)
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        children: [
                          // select input widget 2x or 4x for scaling
                          // DropdownButton(
                          //     hint: const Text("Size"),
                          //     items: const [
                          //       DropdownMenuItem(value: 2, child: Text("2x")),
                          //       DropdownMenuItem(value: 4, child: Text("4x")),
                          //     ],
                          //     onChanged: (value) {
                          //       if (value is int) {
                          //         upscaleImageView.scaleFactor = value;
                          //       }
                          //     },
                          //     value: upscaleImageView.scaleFactor),
                          // const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                state.showImagePicker(context);
                              },
                              child: Text(state.image == null ? "Pick From Photos" : "Pick Other Image"),
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (state.image != null) ...{},
                  const SizedBox(height: 7),
                },
                if (state.error != "") ...{
                  const SizedBox(height: 5),
                  Text(state.error, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 10),
                  if (state.generating)
                    ElevatedButton(
                      onPressed: () {
                        state.cancel = true;
                        state.update();
                      },
                      child: const Text("Cancel"),
                    ),
                },
              ],
            ),
          ),
        ],
      ),
    );
  }
}
