import 'dart:io';
import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
// import 'package:flutter_nude_detector/flutter_nude_detector.dart';
import 'package:provider/provider.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'components/publish_prompt_view_state.dart';

var publishPromptInfo = PublishPromptViewState();

class PublishPromptView extends StatefulWidget {
  final String localImageUrl;
  const PublishPromptView({Key? key, required this.localImageUrl}) : super(key: key);

  @override
  _PublishPromptViewState createState() => _PublishPromptViewState();
}

class _PublishPromptViewState extends BetterState<PublishPromptView> {
  @override
  void initState() {
    super.initState();
    print("creating the publish prompt view");
    publishPromptInfo.localAssetUrl = widget.localImageUrl;
    publishPromptInfo.publish();
  }

  String get percentText {
    if (publishPromptInfo.uploadPercent == 0) {
      return "";
    } else if (publishPromptInfo.uploadPercent == 100) {
      return " Finishing";
    }
    return "${publishPromptInfo.uploadPercent.toStringAsFixed(0)}%";
  }

  @override
  Widget build(BuildContext context) {
    publishPromptInfo.buildContext = context;
    return Scaffold(
      body: ChangeNotifierProvider.value(
        value: publishPromptInfo,
        child: Consumer<PublishPromptViewState>(
          builder: (context, notifier, child) => Center(
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                // mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (publishPromptInfo.error.isNotEmpty == true) ...{
                    const SizedBox(height: 100),
                    Text(publishPromptInfo.error, style: const TextStyle(color: Colors.red)),
                    const SizedBox(height: 50),
                    ElevatedButton(
                      onPressed: () {
                        router.pop();
                      },
                      child: const Text("Close"),
                    ),
                  } else if (!publishPromptInfo.complete) ...{
                    const SizedBox(height: 100),
                    Text(publishPromptInfo.uploading != true ? "Preprocessing..." : "Uploading", style: const TextStyle(fontSize: 20)),
                    const SizedBox(height: 50),
                    const CircularProgressIndicator(),
                    const SizedBox(height: 30),
                    if (publishPromptInfo.uploading) ...{
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 30),
                        child: LinearProgressIndicator(
                          value: publishPromptInfo.uploadPercent / 100,
                          minHeight: 30,
                        ),
                      ),
                      const SizedBox(height: 50),
                      Text("${publishPromptInfo.uploadPercent}%", style: const TextStyle(fontSize: 20)),
                    },
                    const SizedBox(height: 40),
                  } else ...{
                    const SizedBox(height: 200),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Icon(Icons.check, color: Colors.green),
                        SizedBox(width: 10),
                        Text("Published!", style: TextStyle(fontSize: 18)),
                      ],
                    )
                  },
                  const SizedBox(height: 20),
                  if (publishPromptInfo.showNudityMessage) ...{
                    const Center(
                      child: Text("Nudity is only available online and not in apps when published.", textAlign: TextAlign.center),
                    ),
                    const SizedBox(height: 10),
                  },
                  const SizedBox(height: 50),
                  if (publishPromptInfo.clickToClose && publishPromptInfo.complete) ...{
                    TextButton(
                      onPressed: () {
                        router.pop(publishPromptInfo.share);
                      },
                      child: const Text("Close"),
                    ),
                  }
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
