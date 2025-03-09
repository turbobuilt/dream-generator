import 'package:flutter/material.dart';

import 'components/show_equity_details_modal.dart';

class UpgradeEquityNotice extends StatefulWidget {
  @override
  UpgradeEquityNoticeState createState() => UpgradeEquityNoticeState();
}

class UpgradeEquityNoticeState extends State<UpgradeEquityNotice> {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text("You will get 1 credit to spend and one credit of ownership in this app/business each time you purchase a credit."),
        TextButton(
          onPressed: () => showEquityDetailsModal(context),
          child: const Text("More Information", style: TextStyle(color: Colors.blue)),
        ),
      ],
    );
  }
}
