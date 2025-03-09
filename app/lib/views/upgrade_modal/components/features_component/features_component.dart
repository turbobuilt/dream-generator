import 'package:flutter/material.dart';

import 'feature_component.dart';

class FeaturesComponent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        FeatureComponent("Credits Never Expire While Subscribed"),
        FeatureComponent("1 credit buys one normal image"),
        FeatureComponent("8 credits buys one Super image"),
        FeatureComponent("1 credit buys 2600 chat tokens on fast model"),
        FeatureComponent("Help support small business and have fun"),
        FeatureComponent("Support ethical business and AI research to solve poverty")
      ],
    );
  }
}