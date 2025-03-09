// import 'package:advertising_id/advertising_id.dart';
// ignore_for_file: dead_code

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/sample_prompts.dart';
import 'package:dev/main.dart';
import 'package:dev/views/create_image_view/components/error_view.dart';
import 'package:dev/views/create_image_view/components/image_settings/image_settings.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../display_all_images_view.dart';
import 'components/create_image_button.dart';
import 'components/create_image_loading_component.dart';
import 'components/create_image_styles_component.dart';
import 'components/create_image_view_data/create_image_view_data.dart';
import 'components/image_settings/components/image_quality_selector.dart';
import 'components/prompt_input.dart';

class PromptNotifier extends ChangeNotifier {
  var prompt = TextEditingController();
  PromptNotifier() {
    prompt.addListener(() {
      notifyListeners();
    });
  }
  update(String prompt) {
    this.prompt.text = prompt;
    notifyListeners();
  }
}

enum ViewTheme {
  light,
  dark,
}

GlobalKey createPromptWidget = GlobalKey();
class CreateImageView extends StatefulWidget {
  var showStyles = false;
  var expand = false;
  late CreateImageViewData createImageViewData;
  CreateImageView(this.showStyles, this.createImageViewData, {this.expand = false}) {}

  @override
  CreateImageViewState createState() => CreateImageViewState();
}

class CreateImageViewState extends BetterState<CreateImageView> {
  Widget? ad;
  BuildContext? buildContext;
  var isFirstLoad = false;
  var model = "sdxl";
  var cancelButton = null;

  CreateImageViewState() {
    loadSettings();
  }

  loadSettings() async {
    var preferences = await SharedPreferences.getInstance();
    isFirstLoad = preferences.getBool("isFirstLoad") ?? true;
    if (isFirstLoad) {
      preferences.setBool("isFirstLoad", false);
    }
    update(() {
      model = preferences.getString("imageGenerationModel") ?? "sdxl";
    });
  }

  String getImagePath(String styleName) {
    return "assets/style_images/${styleName.replaceAll(" ", "-").toLowerCase()}.png";
  }

  computedTheme() {
    if (widget.createImageViewData.theme == ViewTheme.light && globalDisplayAllImagesViewStore.imagePaths.isNotEmpty) {
      return ViewTheme.light;
    } else {
      return ViewTheme.dark;
    }
  }

  createImage() {
    widget.createImageViewData.model = model;
    widget.createImageViewData.createImage();
  }

  @override
  Widget build(BuildContext context) {
    widget.createImageViewData.context = context;
    return ChangeNotifierProvider.value(
      value: widget.createImageViewData,
      child: Consumer<CreateImageViewData>(
        builder: (context, notifier, child) => Container(
          color: computedTheme() == ViewTheme.light ? const Color.fromARGB(255, 235, 235, 235) : const Color.fromARGB(255, 57, 57, 57),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              if (ad != null) ...{const Text("ad"), ad!},
              Container(
                padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
                child: PromptInput(widget, this)
              ),
              if (widget.showStyles && globalDisplayAllImagesViewStore.imagePaths.isNotEmpty) ...{
                const SizedBox(height: 0),
                CreateImageStylesComponent(widget, this),
              },
              ErrorView(widget, this),
              if (widget.createImageViewData.processing) CreateImageLoadingComponent(widget, this),
              SamplePrompts(widget, this),
              if (!widget.createImageViewData.processing) ImageSettings(widget, this),
              const SizedBox(height: 8),
              CreateImageButton(widget, this),
              if (widget.expand) ...{
                const SizedBox(height: 5),
              }
            ],
          ),
        ),
      ),
    );
  }
}
