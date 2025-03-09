import 'package:flutter/material.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

showEquityDetailsModal(BuildContext context) async {
  await showCupertinoModalBottomSheet(context: context, builder: (context) => EquityDetailsModal());
}

class EquityDetailsModal extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.black, fontWeight: FontWeight.normal, fontSize: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text("Here are the details of this innovative funding strategy. First, all statements are forward looking and are not guaranteed, because I might quit someday. Barring a disaster, however, I truly believe we will change the world working together."),
                    SizedBox(height: 15),
                    Text("First, I believe funding should come from God.  And I believe God gives it when we prove we want to take care of other. This this a business based on love, trying to give you all a good day, so you know you are investing in our collective future when you subscribe.  The goal is to make it fun to subscribe because you are investing in our future."),
                    SizedBox(height: 15),
                    Text("Here are the details. 1) If you contribute \$1, you will receive 1 equity credit.  The first 1000 subscribers will get this benefit.  After that, you will only get .8 credits per dollar spent.  After that, it will drop to .5 credits, and so on, all the way down to .25 credits per dollar.  The goal is that when we IPO, go public, or release a cryptocurrency, your credit will have a market value of at least \$1, hopefully more.  Then as the company grows, if we are anything like Facebook, it could be worth \$10 or \$20 eventually.  These are all forward looking statements, which means I don't know what's going to happen tomorrow. If the Lord wills, we'll all be millionaires."),
                    SizedBox(height: 15),
                    Text("The goal of this business is not to make stupid AI apps. It is to make a business that can thrive by building robots to solve world hunger problems.  The money you invest goes towards AI development.  I work on AI all the time. While there will be ups and downs, off and on, we are attempting to build AI machines that will feed hungry people, and eventually do our work for us."),
                    SizedBox(height: 25),
                    Text("Currently, we are in the research phase of development.  That means, unless we get a lot of help, we are going to take a while to get a prototype built.  We still haven't even designed it yet, or finished with the hardware specs.  But once we do, it will be legendary. There are no guarantees that we will finish anytime soon. So you might not get your money back.  But that's the whole point.  You still get image credits so you can have fun using the app, and you don't suffer the loss of your hard earned income if it goes bust."),
                    SizedBox(height: 15),
                    Text("Lastly, you all are amazing.  I'm so glad you've chosen to sign up.  Hopefully you enjoy using the app. If you want to help, please contact hans@dreamgenerator.ai, and I can get you working with more equity.  God bless in the name of Holy Yeshua.  If you're not religous, that just means 'I hope you have a good day' to religious people."),
                  ],
                ),
              ),
            ),
            SafeArea(bottom:true, child: SizedBox.shrink()),
          ],
        ),
      ),
    );
  }
}