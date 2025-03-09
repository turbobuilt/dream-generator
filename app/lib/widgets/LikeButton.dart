import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../vars.dart';

class LikeButton extends StatelessWidget with ChangeNotifier {
  dynamic item;
  var updatingLikeStatus = false;
  Function likeFn;
  Function unlikeFn;

  LikeButton(this.item, this.likeFn, this.unlikeFn);

  likePressed() async {
    if (updatingLikeStatus) {
      return;
    }
    updatingLikeStatus = true;
    notifyListeners();
    await likeFn();
    updatingLikeStatus = false;
    notifyListeners();
  }
  unlikePressed() async {
    if (updatingLikeStatus) {
      return;
    }
    updatingLikeStatus = true;
    notifyListeners();
    await unlikeFn();
    updatingLikeStatus = false;
    notifyListeners();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: this,
      child: Consumer<LikeButton>(
        builder: (context, data, child) {
          if (item["liked"] == 1) {
            return ElevatedButton(
              // padding on all sizes 10px no min/max width
              style: ButtonStyle(
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                backgroundColor: MaterialStateProperty.all(Colors.white),
                padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 2, 10, 2)),
                minimumSize: MaterialStateProperty.all(const Size(0, 0)),
                // maximumSize: MaterialStateProperty.all(Size(0, 0)),
              ),
              onPressed: () => unlikePressed(),
              // spinner on loading
              child: updatingLikeStatus
                  ? Container(
                      height: 22,
                      width: 24,
                      padding: const EdgeInsets.all(4),
                      child: const CircularProgressIndicator(
                        color: primaryBorder,
                        strokeWidth: 2,
                      ))
                  : const Row(children: [
                      Icon(Icons.undo, color: primaryBorder),
                    ]),
            );
          } else {
            return ElevatedButton(
              // padding on all sizes 10px no min/max width
              style: ButtonStyle(
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                backgroundColor: MaterialStateProperty.all(primaryBackground),
                padding: MaterialStateProperty.all(const EdgeInsets.fromLTRB(10, 2, 10, 2)),
                minimumSize: MaterialStateProperty.all(const Size(0, 0)),
              ),
              onPressed: () => likePressed(),
              child: updatingLikeStatus
                  ? Container(
                      height: 22,
                      width: 24,
                      padding: const EdgeInsets.all(4),
                      child: const CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ))
                  : const Icon(Icons.plus_one, color: primaryForeground),
            );
          }
        },
      ),
    );
  }
}
