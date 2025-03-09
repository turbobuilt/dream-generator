
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/connect_view/connect_view_state.dart';
import 'package:flutter/material.dart';

class ConnectView extends SmartWidget {
  ConnectView() {
    state = connectViewState;
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      child: Text("Connect View"),
    );
  }
}