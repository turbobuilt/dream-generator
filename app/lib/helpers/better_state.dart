import 'package:flutter/material.dart';

abstract class BetterState<T extends StatefulWidget> extends State<T> {
  update([VoidCallback? callback]) {
    if (mounted) setState(() => callback?.call());
  }
}