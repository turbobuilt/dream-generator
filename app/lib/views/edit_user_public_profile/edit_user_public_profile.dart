import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/edit_user_public_profile/components/user_image_editor.dart';
import 'package:flutter/material.dart';

import 'components/profile_description_editor.dart';
import 'components/user_name_editor.dart';
import 'helpers/get_my_profile.dart';

var editUserPublicProfileState = EditUserPublicProfileState();

class EditUserPublicProfileState extends BetterChangeNotifier {
  late var profile = Map<String, dynamic>.from({});
  var loading = true;
  var error = "";
}

class EditUserPublicProfile extends SmartWidget {
  EditUserPublicProfile() {
    state = editUserPublicProfileState;
    getMyProfile().then((result) {
      if (result.error?.isNotEmpty == true) {
        editUserPublicProfileState.error = result.error!;
      } else {
        editUserPublicProfileState.profile = result.result["data"];
      }
      editUserPublicProfileState.loading = false;
      editUserPublicProfileState.update();
    });
  }

  @override
  Widget render(BuildContext context) {
    return Container(
      //background white
      color: Colors.white,
      padding: const EdgeInsets.all(10),
      // 100% width
      width: MediaQuery.of(context).size.width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (editUserPublicProfileState.loading) ...{
            const SizedBox(height: 50),
            const Center(child: CircularProgressIndicator()),
          } else if (editUserPublicProfileState.error.isNotEmpty)
            Padding(padding: const EdgeInsets.all(8.0), child: Center(child: Text(editUserPublicProfileState.error)))
          else ...{
            UserImageEditor(profile: editUserPublicProfileState.profile),
            const SizedBox(height: 10),
            UserNameEditor(profile: editUserPublicProfileState.profile),
          }
        ],
      ),
    );
  }
}
