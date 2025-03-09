import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:dev/views/feed_view/feed_view.dart';
import 'package:flutter/material.dart';

showShareViewReportShareModal(BuildContext context, Map<dynamic, dynamic> share) async {
  return await showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(content: ShareViewReportShareModal(share: share));
    },
  );
}

class ShareViewReportShareModal extends StatefulWidget {
  final Map<dynamic, dynamic> share;
  const ShareViewReportShareModal({required this.share});
  
  @override
  ShareViewReportShareModalState createState() => ShareViewReportShareModalState();
}

class ShareViewReportShareModalState extends BetterState<ShareViewReportShareModal> {
  bool loading = false;
  String? error;
  bool success = false;
  sendObjectionableContentReport(String reason, int shareId) async {
    print("reporting post for reason: $reason");
    update(() => loading = true);
    await Future.delayed(const Duration(seconds: 2));
    var result = await postRequest("/api/report-objectionable-content", Map<dynamic, dynamic>.from({"reason": reason, "shareId": shareId}));
    if (result.error != null) {
      update(() => error = result.error);
    } else {
      update(() => success = true);
    }
    update(() {
      loading = false;
    });
    feedView.items?.removeWhere((element) => element["id"] == shareId);
    feedView.update();
  }

  @override
  Widget build(BuildContext context) {
    var buttonStyle = ButtonStyle(
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      backgroundColor: MaterialStateProperty.all(Colors.white),
      padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 5, 10, 5)),
      minimumSize: MaterialStateProperty.all(Size(MediaQuery.sizeOf(context).width - 10, 0)),
    );
    const textStyle = TextStyle(color: Colors.black, fontSize: 16);
    if (loading || success || error?.isNotEmpty == true) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (loading)
            const Center(child: CircularProgressIndicator())
          else if (success) ...{
            const Text("Reported Successfully", style: textStyle),
            const SizedBox(height: 15),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: buttonStyle,
              child: const Text('Close', style: textStyle),
            ),
          } else if (error?.isNotEmpty == true)
            Text("Error: $error", style: textStyle),
        ],
      );
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text("Why are you reporting this post?", style: textStyle),
        const SizedBox(height: 15),
        ElevatedButton(
          onPressed: () => sendObjectionableContentReport("gratuitous violence", widget.share["id"]),
          style: buttonStyle,
          child: const Text('Gratuitous Violence', style: textStyle),
        ),
        const SizedBox(height: 15),
        ElevatedButton(
          onPressed: () => sendObjectionableContentReport("gratuitous sexual content", widget.share["id"]),
          style: buttonStyle,
          child: const Text('Gratuitous Sexual Content', style: textStyle),
        ),
        const SizedBox(height: 15),
        ElevatedButton(
          onPressed: () => sendObjectionableContentReport("horrifyingly ugly", widget.share["id"]),
          style: buttonStyle,
          child: const Text('Horrifyingly Ugly', style: textStyle),
        ),
      ],
    );
  }
}
