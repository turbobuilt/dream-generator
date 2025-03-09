import 'package:dev/helpers/better_state.dart';
import 'package:dev/main.dart';
import 'package:dev/views/display_output_view/components/pick_user_name_modal.dart';
import 'package:flutter/material.dart';

class UserNameEditor extends StatefulWidget {
  final Map<String, dynamic> profile;
  const UserNameEditor({required this.profile});

  @override
  UserNameEditorState createState() => UserNameEditorState();
}

class UserNameEditorState extends BetterState<UserNameEditor> {

  @override
  Widget build(BuildContext context) {
    return Container(
      child: GestureDetector(
        onTap: () async {
          await tryShowPickUserNameModal(context, force: true);
          update();
        },
        child: Text(globalAuthenticatedUser.userName?.isNotEmpty == true ? globalAuthenticatedUser.userName! : "Set Username"),
      ),
    );
  }
}
