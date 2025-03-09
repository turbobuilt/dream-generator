import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../../../helpers/router.dart';
import 'share_card_more_options_modal.dart';

class UserNameBar extends StatelessWidget {
  final Map<dynamic, dynamic> share;
  const UserNameBar({required this.share});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 0),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              router.pushNamed("userPublicProfile", pathParameters: {"userName": share["userName"].toString()});
            },
            child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 5),
                child: Text(
                  "${share["userName"] ?? ""}",
                  style: const TextStyle(color: Colors.blue, decoration: TextDecoration.underline),
                )),
          ),
          const Spacer(),
          //more icon
          GestureDetector(
            onTap: () {
              showShareCardMoreOptionsModal(context, share);
            },
            child: const Padding(padding: EdgeInsets.symmetric(vertical: 5), child: Icon(Icons.more_horiz)),
          ),
        ],
      ),
    );
  }
}
