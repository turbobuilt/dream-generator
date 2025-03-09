import 'package:flutter/material.dart';

import '../../main_view/main_view.dart';
import 'share_card_view_data.dart';

class AddCommentComponent extends StatelessWidget {
  final ShareCardViewData data;
  final TapOutsideOverlayState tapOutsideOverlayState;

  const AddCommentComponent(this.data, this.tapOutsideOverlayState, {Key? key}) : super(key: key);

  postComment() {
    tapOutsideOverlayState.hide();
    FocusManager.instance.primaryFocus?.unfocus();
    data.submitComment();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5),
      child: Column(
        children: [
          const SizedBox(height: 4),
          TextField(
            controller: data.commentTextController,
            autofocus: false,
            style: const TextStyle(fontSize: 15, height: 1.1),
            decoration: const InputDecoration(labelText: "Comment", contentPadding: EdgeInsets.all(0), isDense: true),
            enabled: true,
            autocorrect: true,
            maxLines: 10,
            minLines: 1,
            scrollPadding: const EdgeInsets.only(bottom: 90),
            // onTap: () => tapOutsideOverlayState.show(),
            onTapOutside: (b) {
              // tapOutsideOverlayState.hide();
              FocusManager.instance.primaryFocus?.unfocus();
            },
            textInputAction: TextInputAction.go,
            onSubmitted: (value) {
              postComment();
            },
          ),
          const SizedBox(height: 1),
          if (data.commentTextController.text.isNotEmpty)
            ElevatedButton(
              // 80% width
              style: ButtonStyle(
                minimumSize: MaterialStateProperty.all(Size(MediaQuery.of(context).size.width * .8, 20)),
              ),
              onPressed: () {
                postComment();
              },
              // spinner if posting
              child: data.postingComment
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white))
                  : const Text("Comment"),
            ),
        ],
      ),
    );
  }
}
