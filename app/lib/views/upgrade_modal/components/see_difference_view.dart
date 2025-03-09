import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';

class SeeDifferenceView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        router.pushNamed("compareImageQuality");
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: Colors.grey.shade500, width: 1),
            bottom: BorderSide(color: Colors.grey.shade500, width: 1),
          ),
          // image: DecorationImage(
          //   image: AssetImage("assets/images/galaxy_big.avif"),
          //   fit: BoxFit.cover,
          // ),
        ),
        child: const Column(
          children: [
            Text("Create stunning images", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 5),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // const Spacer(),
                Text("Tap to See the Difference!", style: TextStyle(fontSize: 16, fontWeight: FontWeight.normal)),
                // Expanded(child: FeatureComponent("Ultra High Quality Images")),
                Icon(Icons.chevron_right),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
