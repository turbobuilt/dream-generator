import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/main.dart';
import 'package:dev/views/display_output_audio_view/display_output_audio_view.dart';
import 'package:dev/views/display_output_view/components/pick_user_name_modal.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/publish_prompt_view/components/publish_prompt_view_state.dart';
import 'package:dev/views/publish_prompt_view/publish_prompt_view.dart';
import 'package:flutter/material.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:provider/provider.dart';

class PublishAudioButton extends StatefulWidget {
  DisplayOutputView? parentImageWidget;
  DisplayOutputViewState? parentImageWidgetState;

  DisplayOutputAudioViewState? parentAudioWidgetState;
  get parentAudioWidget {
    return parentAudioWidgetState?.widget;
  }

  PublishAudioButton({this.parentImageWidget, this.parentImageWidgetState, this.parentAudioWidgetState});

  @override
  PublishAudioButtonState createState() => PublishAudioButtonState();
}

class PublishAudioButtonState extends BetterState<PublishAudioButton> {
  var publishPromptInfo = PublishPromptViewState();

  @override
  void initState() {
    super.initState();
    print("creating the display image button content");
  }

  startPublishPrompt({Function? onComplete}) async {
    if (globalStore.currentImageData?.promptId != null) {
      print("already published so returning after callback");
      // already published
      if (onComplete != null) {
        onComplete();
      }
      return;
    }
    await tryShowPickUserNameModal(context);
    if (globalAuthenticatedUser.userName?.isNotEmpty != true) {
      return;
    }
    await publishPrompt();
    if (onComplete != null) {
      onComplete();
    }
  }

  safeSetState() {
    if (mounted) {
      update(() {});
    }
  }

  publishPrompt() async {
    print("starting to publish prompt");
    try {
      if (widget.parentAudioWidget?.generateAudioRequest != null) {
        if (widget.parentAudioWidget?.generateAudioRequest.downloaded == false) {
          return;
        }
        publishPromptInfo.localAssetUrl = await widget.parentAudioWidget?.generateAudioRequest.getLocalPath();
        if (publishPromptInfo.localAssetUrl == "") {
          return;
        }
        await publishPromptInfo.publishAudio(widget.parentAudioWidget!.generateAudioRequest);
        widget.parentAudioWidget?.generateAudioRequest.published = true;
        await widget.parentAudioWidget?.generateAudioRequest.save();
        safeSetState();
        return publishPromptInfo.share;
      } else if (widget.parentAudioWidgetState != null) {

      } else {
        showAlert("No parent widget... contact programmer for help this should not happen!", context: context, message: "No parent widget");
      }
    } catch (err, stack) {
      publishPromptInfo.publishing = false;
      safeSetState();
      print("Error publishing");
      print(err);
      print(stack);
      showAlert("Error publishing ", context: context, message: err.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: publishPromptInfo,
      child: Consumer<PublishPromptViewState>(
        builder: (context, notifier, child) => ElevatedButton(
          onPressed: startPublishPrompt,
          style: widget.parentImageWidgetState?.buttonStyle,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (!publishPromptInfo.publishing) ...{
                if ((widget.parentAudioWidget?.generateAudioRequest.published ?? false) == false) ...{
                  Icon(Icons.cloud_upload_outlined, size: widget.parentImageWidgetState?.iconSize),
                  const SizedBox(height: 5),
                  const Text("Publish!"),
                } else ...{
                  Icon(Icons.check, size: widget.parentImageWidgetState?.iconSize),
                  const SizedBox(height: 5),
                  const Text("Published!", style: TextStyle(fontSize: 12)),
                }
              } else ...{
                const Center(child: CircularProgressIndicator()),
                const SizedBox(height: 3),
                Center(child: Text("${publishPromptInfo.totalPercentComplete}%")),
              }
            ],
          ),
        ),
      ),
    );
  }
}
