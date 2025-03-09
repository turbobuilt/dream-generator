import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';

class BetterChatPromo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // router.pushNamed("compareImageQuality");
      },
      child: DefaultTextStyle(
        style: TextStyle(
          color: Colors.white,
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            border: Border(
                // top: BorderSide(color: Colors.grey.shade500, width: 1),
                // bottom: BorderSide(color: Colors.grey.shade500, width: 1),
                ),
            image: DecorationImage(
              image: AssetImage("assets/images/matrix.avif"),
              fit: BoxFit.cover,
            ),
          ),
          child: Column(
            children: [
              Container(
                // padding: const EdgeInsets.symmetric(vertical: 0, horizontal: 5),
                // // radius
                // decoration: BoxDecoration(
                //   color: Colors.white.withOpacity(.8),
                //   borderRadius: BorderRadius.circular(5),
                // ),
                child: Text(
                  "Smarter AI",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              SizedBox(height: 5),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // const Spacer(),
                  Container(
                  //   padding: const EdgeInsets.symmetric(vertical: 0, horizontal: 5),
                    child: Text(
                      "Save time with better models",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.normal),
                    ),
                  //   // radius
                    // decoration: BoxDecoration(
                    //   color: Colors.white,
                    //   borderRadius: BorderRadius.circular(5),
                    // ),
                  //   clipBehavior: Clip.hardEdge,
                  ),
                  // Expanded(child: FeatureComponent("Ultra High Quality Images")),
                  // Icon(Icons.chevron_right),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
