import 'package:dev/helpers/better_state.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dev/views/share_card/components/share_card_view_data.dart';
import 'package:dev/views/share_card/share_card_view.dart';
import 'package:dev/views/user_public_profile/components/user_shares/lib/get_user_shares.dart';
import 'package:flutter/material.dart';

class UserShares extends StatefulWidget {
  final userName;
  const UserShares(this.userName);

  @override
  UserSharesState createState() => UserSharesState();
}

class UserSharesState extends BetterState<UserShares> {
  List<dynamic> shares = [];
  int page = 1;

  @override
  void initState() {
    super.initState();
    getItems();
  }

  getItems() async {
    shares = await getUserShares(context, widget.userName, page);
    update();
  }

  @override
  Widget build(BuildContext context) {
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (BuildContext context, int index) {
          var shareCardViewData = ShareCardViewData();
          shareCardViewData.share = shares[index];
          shareCardViewData.context = context;
          return ShareCardView(shareCardViewData);
        },
        childCount: shares.length,
      ),
    );
  }
}
