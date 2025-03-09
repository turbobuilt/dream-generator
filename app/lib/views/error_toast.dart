import 'package:dev/helpers/better_state.dart';
import 'package:flutter/material.dart';

class ErrorToastData extends ChangeNotifier {
  String error = "error test";
}

final globalErrorToastData = ErrorToastData();

class ErrorToast extends StatefulWidget {
  @override
  _ErrorToastState createState() => _ErrorToastState();
}

class _ErrorToastState extends BetterState<ErrorToast> {
  ErrorToastData? errorToastData = globalErrorToastData;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(seconds: 5), () {
        update(() {
          errorToastData!.error = "";
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Container(
        padding: const EdgeInsets.all(20.0),
        decoration: BoxDecoration(
          color: const Color.fromRGBO(233, 233, 233, 1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Center(
          child: Text(
            errorToastData!.error,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14),
          ),
        ),
      ),
    );
  }
}

void main() {
  runApp(MaterialApp(
    home: Scaffold(
      body: Center(
        child: ErrorToast(),
      ),
    ),
  ));
}