import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/network_helper.dart';
import 'package:flutter/material.dart';

showReportUserModal(BuildContext context, int shareId) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(content: ReportUserModal(shareId: shareId));
    },
  );
}

class ReportUserModal extends StatefulWidget {
  final int shareId;
  ReportUserModal({required this.shareId});
  @override
  ReportUserModalState createState() => ReportUserModalState();
}

class ReportUserModalState extends BetterState<ReportUserModal> {
  bool loading = false;
  String? error;
  bool success = false;
  sendObjectionableContentReport(String reason, int shareId) async {
    print("reporting post for reason: $reason");
    update(() => loading = true);
    await Future.delayed(const Duration(seconds: 2));
    var result = await postRequest("/api/report-user", Map<String, dynamic>.from({"reason": reason, "shareId": shareId}));
    if (result.error != null) {
      update(() => error = result.error);
    } else {
      update(() => success = true);
    }
    update(() {
      loading = false;
    });
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
          onPressed: () => sendObjectionableContentReport("gratuitous violence", widget.shareId),
          style: buttonStyle,
          child: const Text('Gratuitous Violence', style: textStyle),
        ),
        const SizedBox(height: 15),
        ElevatedButton(
          onPressed: () => sendObjectionableContentReport("gratuitous sexual content", widget.shareId),
          style: buttonStyle,
          child: const Text('Gratuitous Sexual Content', style: textStyle),
        ),
        const SizedBox(height: 15),
        ElevatedButton(
          onPressed: () => sendObjectionableContentReport("horrifyingly ugly", widget.shareId),
          style: buttonStyle,
          child: const Text('Horrifyingly Ugly', style: textStyle),
        ),
      ],
    );
  }
}
