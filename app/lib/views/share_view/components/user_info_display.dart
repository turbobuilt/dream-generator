import 'package:flutter/material.dart';

import '../../../helpers/router.dart';

class UserInfoDisplay extends StatelessWidget {
  final Map<dynamic, dynamic> share;
  const UserInfoDisplay({required this.share});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const SizedBox(width: 10),
        GestureDetector(
          onTap: () => router.pushNamed("userProfile", pathParameters: {"userName": share['userName']}),
          child: Text(share["userName"] ?? "no user", style: const TextStyle(fontSize: 18, color: Colors.blue, decoration: TextDecoration.underline)),
        ),
      ],
    );
  }
}
