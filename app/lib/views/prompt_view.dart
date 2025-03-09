
import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/create_image_view/create_image_view.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:flutter/material.dart';

import '../helpers/network_helper.dart';
import '../models/Prompt.dart';
import 'main_view/components/main_tab_bar.dart';

class PromptView extends StatefulWidget {
  late int promptId;
  PromptView(String? id) {
    promptId = int.parse(id ?? "0");
  }

  @override
  PromptViewState createState() => PromptViewState(promptId);
}

class PromptViewState extends BetterState<PromptView> {
  Prompt? prompt;
  var error = "";
  late int id;
  var loading = true;

  PromptViewState(this.id) {
    getPrompt();
  }

  getPrompt() async {
    final response = await getRequest("/api/prompt/$id");

    if (response.error != null) {
      update(() {
        error = response.error ?? "error";
      });
      return;
    }
    update(() {
      prompt = Prompt();
      prompt?.fromMap(response.result);
      loading = false;
    });
  }

  createImageWithPrompt() async {
    customTabBarState.setTab(Views.createImageView);
    createImageViewHistory.promptNotifier.prompt.text = prompt?.text ?? "";
    createImageViewHistory.selectedStyle = prompt?.style ?? "None";
    createImageViewHistory.promptId = prompt?.id;
    createImageViewHistory.createImage();
    // Navigator.of(context).popUntil((route) => route.settings.name == "home");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox(
        height: MediaQuery.of(context).size.height,
        child: Column(
          // padding: const EdgeInsets.all(0),
          // shrinkWrap: true,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
                // background gradient left to right blue to purple
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Colors.blue, Colors.purple],
                  ),
                ),
                child: AppBar(title: const Text("Detailed Description"))),
            ListView(
              shrinkWrap: true,
              padding: const EdgeInsets.all(20),
              children: [
                if (prompt != null) ...{
                  const SizedBox(height: 20),
                  const Text("Title", style: TextStyle(fontSize: 16)),
                  const SizedBox(height: 4),
                  Text(prompt!.title, style: const TextStyle(fontSize: 20)),
                  const SizedBox(height: 20),
                  const Text("Image Description", style: TextStyle(fontSize: 16)),
                  Text(prompt!.text, style: const TextStyle(fontSize: 18)),
                  const SizedBox(height: 20),
                  ElevatedButton(onPressed: createImageWithPrompt, child: const Text("Create Image"))
                } else ...{
                  const SizedBox(height: 40),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Text("Loading...", style: TextStyle(fontSize: 20)),
                      const SizedBox(height: 20),
                      const CircularProgressIndicator(),
                      const SizedBox(height: 20),
                      if (error.isNotEmpty) Text(error, style: const TextStyle(color: Colors.red)),
                    ],
                  ),
                }
              ],
            ),
          ],
        ),
      ),
    );
  }
}
