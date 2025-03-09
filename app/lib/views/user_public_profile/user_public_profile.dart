import 'package:dev/helpers/better_state.dart';
import 'package:dev/views/user_public_profile/components/add_friend_button.dart';
import 'package:dev/views/user_public_profile/components/name_and_image.dart';
import 'package:dev/views/user_public_profile/components/user_public_profile_main_image.dart';
import 'package:dev/views/user_public_profile/components/user_shares/user_shares.dart';
import 'package:dev/widgets/pretty_app_bar.dart';
import 'package:flutter/material.dart';

import '../../helpers/network_helper.dart';

class UserPublicProfile extends StatefulWidget {
  final String userName;
  const UserPublicProfile(this.userName);

  @override
  UserPublicProfileState createState() => UserPublicProfileState();
}

loadProfile(UserPublicProfileState state) async {
  // load profile
  try {
    final result = await getRequest("/api/get-user-profile?userName=${state.widget.userName}");
    if (result.error?.isNotEmpty == true) {
      state.error = result.error!;
      return;
    }
    state.profile = result.result["profile"];
  } catch (e, stack) {
    state.error = e.toString();
    if (state.error == "") {
      state.error = "Error loading profile";
    }
    print(e);
    print(stack);
  } finally {
    state.loading = false;
    state.update();
  }
}

class UserPublicProfileState extends BetterState<UserPublicProfile> {
  var error = "";
  var profile = Map<String, dynamic>.from({});
  var loading = true;

  @override
  void initState() {
    super.initState();
    loadProfile(this);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          PrettyAppBar(title: "Profile"),
          if (error.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(10),
              child: Text(error, style: const TextStyle(color: Colors.red)),
            ),
          if (loading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else if (profile.isEmpty)
            const Expanded(child: Center(child: Text("No profile found")))
          else ...{
            Expanded(
              child: CustomScrollView(slivers: [
                SliverPersistentHeader(
                  pinned: true,
                  delegate: HeaderContent(
                    child: NameAndImage(profile: profile, onUpdate: () => update(() {})),
                  ),
                ),
                UserShares(widget.userName),
              ]),
            ),
          },
        ],
      ),
    );
  }
}

