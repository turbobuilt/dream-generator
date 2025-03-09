import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

class Redirect extends StatelessWidget {
  BuildContext context;
  GoRouterState state;
  Redirect(this.context, this.state);

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance?.addPostFrameCallback((_) {
      // get querystring
      // var query = state.queryParameters;
      print("full path ${this.state.fullPath}");
      // GoRouterState.of(context).uri.queryParams;
    });

    return Container(); // Replace this with your desired widget
  }
}
