import 'package:dev/helpers/router.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_avif/flutter_avif.dart';

class FriendAddNotification extends StatelessWidget {
  final Map<String, dynamic> notification;

  const FriendAddNotification(this.notification);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => router.pushNamed("userPublicProfile", pathParameters: {"userName": notification['friendUserName']}),
      child: Container(
        padding: const EdgeInsets.all(10),
        child: Row(
          children: <Widget>[
            notification['friendPictureGuid'] != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(50),
                    child: AvifImage.network("https://images.dreamgenerator.ai/profile-pictures/${notification['friendPictureGuid']}"),
                  )
                : const Icon(Icons.person),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(notification['friendUserName']),
                const Text("Added you as a friend!"),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
