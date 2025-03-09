import 'package:dev/helpers/better_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

abstract class BetterChangeNotifier extends ChangeNotifier {
  update() {
    notifyListeners();
  }
}

abstract class SmartWidget<T extends BetterChangeNotifier> extends StatefulWidget {
  late T state;
  SmartWidget();
  Widget render(BuildContext context);

  @override
  SmartWidgetState createState() => SmartWidgetState();
}

class SmartWidgetState extends BetterState<SmartWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget.state,
      child: Consumer<BetterChangeNotifier>(
        builder: (context, changeNotifier, child) {
          return widget.render(context);
        },
      ),
    );
  }
}
