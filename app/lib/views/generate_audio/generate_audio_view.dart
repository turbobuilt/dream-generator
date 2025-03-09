import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/display_output_audio_view/components/audio_display.dart';
import 'package:dev/views/generate_audio/components/input_textarea.dart';
import 'package:dev/views/generate_audio/generate_audio_state.dart';
import 'package:dev/widgets/small_app_bar.dart';
import 'package:flutter/material.dart';

class GenerateAudioView extends SmartWidget<GenerateAudioState> {
  GenerateAudioView() {
    state = generateAudioState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      color: Colors.white,
      width: MediaQuery.of(context).size.width,
      child: Column(
        children: [
          SmallAppBar(title: "Generate Audio"),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(0),
                    itemCount: state.audioFiles.length,
                    itemBuilder: (context, index) {
                      var item = state.audioFiles[index];
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: GestureDetector(
                          onTap: () {
                            generateAudioState.showAudio(item);
                          },
                          child: Row(
                            children: [
                              // Expanded(child: AudioDisplay(item, playable: false)),
                              Expanded(
                                child: Text(item.prompt),
                              ),
                              // const SizedBox(width: 8),
                              // IconButton(
                              //   onPressed: () {
                              //     generateAudioState.showAudio(item);
                              //   },
                              //   icon: const Icon(Icons.menu),
                              // ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (state.error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Center(child: Text(state.error)),
                  ),
                // prompt input
                Padding(padding: const EdgeInsets.all(8.0), child: AudioPromptInput()),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
