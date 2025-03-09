import 'dart:convert';

import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:dev/views/ai_chat_view/ai_chat_view_state.dart';
import 'package:dev/views/create_image_view/components/start_trial_dialog.dart';
import 'package:dev/views/main_view/components/components/custom_tab_bar_state.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/upgrade_modal/upgrade_modal.dart';
import 'package:flutter/material.dart';

import '../../../main_view/components/main_tab_bar.dart';

class ChatInput extends StatefulWidget {
  var inputController = TextEditingController();

  @override
  ChatInputState createState() => ChatInputState();
}

class ChatInputState extends BetterState<ChatInput> {
  var controller = TextEditingController();
  var submitting = false;
  var loading = false;

  postChat(BuildContext context) async {
    print("posting chat");
    var message = widget.inputController.text;
    if (submitting || message.isEmpty) {
      return;
    }
    // var needsToStartTrial = await showStartTrialDialog(context);

    var needsToStartTrial = await tryShowOutOfCreditsModal(context, false);
    if (needsToStartTrial) {
      return;
    }

    // if (globalAuthenticatedUser.plan != "complete") {
    //   // show upgrade dialog
    //   showChatUpgradeDialog(context);
    //   return;
    // }
    aiChatViewGlobalState.currentChat.add({"content": message, "role": 'user', "source": 'local'});
    aiChatViewGlobalState.currentChat.add({"content": "", "role": 'assistant', "source": 'local'});
    aiChatViewGlobalState.update();
    update(() {
      submitting = true;
      aiChatViewGlobalState.error = "";
    });
    Map<dynamic, dynamic> body = {
      "messages": aiChatViewGlobalState.currentChat,
    };
    processData(String data) {
      if (data[0] == "d") {
        var spaceIndex = data.indexOf(" ");
        var length = int.parse(data.substring(1, spaceIndex));
        var msg = data.substring(spaceIndex + 1, spaceIndex + 1 + length);
        aiChatViewGlobalState.currentChat.last["content"] += msg;
        data = data.substring(spaceIndex + 1 + length);
        if (data.isNotEmpty) {
          processData(data);
        } else {
          aiChatViewGlobalState.update();
        }
      } else if (data[0] == "e") {
        try {
          var json = data.substring(2);
          var parsed = jsonDecode(json);
          globalAuthenticatedUser.creditsRemaining = double.parse(parsed["creditsRemaining"].toString());
          globalStore.saveUserData();
          mainViewState.update();
        } catch (e) {
          print("error parsing json: $e");
        }
      }
    }

    try {
      var response = await postRequest("/api/post-ai-chat", body, sseCallback: processData);
      update(() {
        submitting = false;
      });
      if (response.error?.isNotEmpty == true) {
        update(() {
          aiChatViewGlobalState.error = response.error!;
        });
        if (response.result?["code"] == "insufficient_credits") {
          customTabBarState.setTab(Views.purchasesView);
        }
        return;
      } else {}

      widget.inputController.clear();
    } catch (e) {
      aiChatViewGlobalState.error = "Error: $e";
      print("error in post chat");
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (aiChatViewGlobalState.error.isNotEmpty)
            Text(aiChatViewGlobalState.error, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: TextField(
                  focusNode: aiChatViewGlobalState.inputFocusNode,
                  controller: widget.inputController,
                  decoration: const InputDecoration(hintText: 'Type a message...'),
                  enableSuggestions: true,
                  autocorrect: false,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (value) => postChat(context),
                  autofocus: true,
                  maxLines: 8,
                  minLines: 1,
                  onChanged: (value) {
                    update(() {});
                  },
                ),
              ),
              // if (widget.inputController.text.isNotEmpty)
              // if (!submitting)
              //   GestureDetector(
              //     onTap: () {
              //       print("button pressed; ");
              //       return;
              //       postChat(context);
              //     },
              //     child: const Icon(Icons.send)
              //   )
              // else
              // const SizedBox(height: 15, width: 15, child: CircularProgressIndicator()),
            ],
          ),
        ],
      ),
    );
  }
}
