import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/ai_chat_view/ai_chat_view_state.dart';
import 'package:dev/widgets/credits_row.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'components/ai_chat_display/ai_chat_display.dart';
import 'components/chat_input/chat_input.dart';

class AiChatView extends SmartWidget<AiChatViewState> {
  AiChatView() {
    state = aiChatViewGlobalState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      color: Colors.white,
      child: Column(
        children: [
          CreditsRow(),
            
          Expanded(child: AiChatDisplay(state)),
          ChatInput(),
        ],
      ),
    );
  }
}
