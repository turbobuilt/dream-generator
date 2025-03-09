import 'dart:async';
import 'package:dev/helpers/better_state.dart';
import 'package:flutter/material.dart';
import "dart:math";

class BouncingLoadingDots extends StatefulWidget {
  @override
  _BouncingLoadingDotsState createState() => _BouncingLoadingDotsState();
}

class _BouncingLoadingDotsState extends BetterState<BouncingLoadingDots> with TickerProviderStateMixin {
  final int _numberOfDots = 3;
  final List<AnimationController> _animationControllers = [];
  final List<Animation<double>> _animations = [];
  final Duration _animationDuration = Duration(milliseconds: 600);
  final double _dotSize = 20.0;
  final colors = [
    // Colors.red,
    // Colors.green,
    Colors.blue,
    Colors.blue,
    Colors.blue,
  ];

  @override
  void initState() {
    super.initState();
    final bounceOutCurves = [
      Curves.easeInOut,
      Curves.easeInOut,
      Curves.easeInOut,
      // Curves.easeOutQuint,
      // Curves.easeOutQuad,
    ];
    final durations = [
      Duration(milliseconds: 400),
      Duration(milliseconds: 600),
      Duration(milliseconds: 1200),
    ];

    for (int i = 0; i < _numberOfDots; i++) {
      final controller = AnimationController(
        duration: durations[i],
        vsync: this,
      );

      final curve = bounceOutCurves[i % bounceOutCurves.length];
      final tween = Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: curve));
      _animationControllers.add(controller);
      _animations.add(tween.animate(controller));
      controller.addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          controller.reverse();
          // set to random duration between 500 and 1500 milliseconds
          // controller.duration = Duration(milliseconds: 500 + (Random().nextDouble() * 1000).toInt());
        } else if (status == AnimationStatus.dismissed) {
          controller.forward();
        }
      });

      controller.forward();
    }
  }

  @override
  void dispose() {
    for (var controller in _animationControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxExtent = constraints.maxWidth - _dotSize;
        return Stack(
          // mainAxisAlignment: MainAxisAlignment.start,
          // crossAxisAlignment: CrossAxisAlignment.center,
          children: List<Widget>.generate(_numberOfDots, (int index) {
            return AnimatedBuilder(
              animation: _animationControllers[index],
              builder: (BuildContext context, Widget? child) {
                final offset = _animations[index].value * maxExtent; // constraints.maxWidth * (_animations[index].value / (index + 1))  - _dotSize*index;
                return Transform.translate(
                  offset: Offset(offset, 0.0),
                  child: Container(
                    width: _dotSize,
                    height: _dotSize,
                    decoration: BoxDecoration(
                      color: colors[index],
                      shape: BoxShape.circle,
                    ),
                  ),
                );
              },
            );
          }),
        );
      },
    );
  }
}
