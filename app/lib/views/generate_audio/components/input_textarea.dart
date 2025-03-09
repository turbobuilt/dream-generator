import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/generate_audio/generate_audio_state.dart';
import 'package:dev/widgets/BouncingLoadingDots.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class AudioPromptInput extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return AudioPromptInputState();
  }
}

class AudioPromptInputState extends BetterState<AudioPromptInput> {
  var text = "";
  var minChars = 5;

  generateButtonText() {
    if (text.length < minChars) {
      return "${minChars - text.length} More Characters";
    }
    return "Generate Audio";
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        const Text("Enter text to generate audio"),
        TextField(
          controller: generateAudioState.promptTextController,
          autofocus: true,
          maxLines: 5,
          minLines: 1,
          onChanged: (val) {
            setState(() {
              text = val;
            });
          },
          autocorrect: true,
          onSubmitted: (val) {
            if (val.length >= minChars) generateAudioState.generateAudio();
          },
        ),
        if (!generateAudioState.generatingAudio)
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ElevatedButton(
                onPressed: () {
                  if (text.length >= minChars) generateAudioState.generateAudio();
                },
                child: Text(generateButtonText()),
              ),
            ],
          )
        else
          Row(
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: ConstrainedBox(
                  // any height, max width is 200
                  constraints: BoxConstraints.loose(const Size(250, double.infinity)),
                  child: BouncingLoadingDots(),
                ),
              ),
            ],
          ),
      ],
    );
  }
}
