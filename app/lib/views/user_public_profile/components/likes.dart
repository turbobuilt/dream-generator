import 'package:dev/helpers/better_state.dart';
import 'package:flutter/material.dart';

import '../../../helpers/network_helper.dart';

getUserLikes(int userId) async {
  final result = await getRequest("/api/get-user-likes?userId=$userId");
  if (result.error != null) {
    print(result.error);
  } else {
    print(result.result);
  }
}

class Likes extends StatefulWidget {
  final Map<dynamic, dynamic> profile;
  const Likes({required this.profile});

  @override
  LikesState createState() => LikesState();
}

class LikesState extends BetterState<Likes> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      child: const Column(
        children: [
          Text("Likes", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          SizedBox(height: 10),
          Text("Coming soon!"),
        ],
      ),
    );
  }
}
