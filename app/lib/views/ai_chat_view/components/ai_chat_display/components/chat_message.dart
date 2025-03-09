import 'package:flutter/material.dart';
import 'package:flutter_highlight/themes/a11y-dark.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:flutter_highlight/themes/a11y-light.dart';

class ChatMessage extends StatelessWidget {
  final Map<dynamic, dynamic> message;
  const ChatMessage(this.message);
  // { id: 0, content: "```\nprint('yeshua loves you')\n```", role: 'user', source: 'local' }

  @override
  Widget build(BuildContext context) {
    var isAssistant = message['role'] == 'assistant';
    var fontSize = (isAssistant ? 14 : 12).toDouble();
    var textStyle = TextStyle(fontSize: fontSize);
    // final codeWrapper = (child, text, language) =>        CodeWrapperWidget(child, text, language);
    var defaultPadding = const EdgeInsets.symmetric(horizontal: 3, vertical: 5);
    var config = MarkdownConfig(configs: [
      PreConfig.darkConfig.copy(
        theme: a11yDarkTheme,
        textStyle: textStyle,
        styleNotMatched: const TextStyle(
          color: Colors.white,
        ),
        padding: defaultPadding,
        decoration: BoxDecoration(
          color: const Color.fromARGB(255, 47, 47, 47),
          borderRadius: BorderRadius.circular(0),
        ),
      ),
      PConfig(textStyle: textStyle),
      // HrConfig(height: 1),
    ]);
    var widgets =  MarkdownGenerator(
      linesMargin: const EdgeInsets.all(4),
    ).buildWidgets(message['content'], config: config);
    // each widget is a padding widget.  Make padding defaultPadding
    // for (var i = 0; i < widgets.length; i++) {
    //   Padding widget = widgets[i] as Padding;
    //   widget.padding = defaultPadding;

    //   widgets[i] = Padding(padding: defaultPadding, child: widgets[i]);
    // }
    return SelectionArea(child: Column(children:widgets));

    // return Container(
    //   padding: const EdgeInsets.fromLTRB(4, 0, 4, 0),
    //   child: MarkdownBlock(
    //     data: message['content'],
    //     config: config,
    //   ),
    // );
  }
}
