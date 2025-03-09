import 'package:dev/views/video_view/video_call_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class VideoChatControlButtons extends StatelessWidget {
  // final Function() onEndCall;
  // final Function() onToggleVideo;
  // final Function() onToggleAudio;
  // final Function() onToggleSpeaker;

  const VideoChatControlButtons({
    Key? key,
    // required this.onEndCall,
    // required this.onToggleVideo,
    // required this.onToggleAudio,
    // required this.onToggleSpeaker,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: videoCallState,
      child: Consumer<VideoCallState>(builder: (context, state, child) {
        return Container(
          padding: const EdgeInsets.all(10),
          // border radius
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white.withOpacity(1),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // const Text("User Name", style: TextStyle(fontSize: 16, color: Colors.black)),
              const Spacer(),
              // ElevatedButton.icon(onPressed: videoCallState.closeVideoCall, icon: const Icon(Icons.call_end), label: const Text("close")),
              // IconButton(
              //   icon: const Icon(Icons.call_end),
              //   onPressed: videoCallState.closeVideoCall,
              // ),
              // ElevatedButton(
              //   onPressed: () {
              //     videoCallState.receiveCall(call);
              //   },
              //   style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              //   child: const Icon(Icons.phone, color: Colors.white,),
              // ),
              if (!videoCallState.isConfirmingClose)
                ElevatedButton(
                  onPressed: () {
                    print("hit");
                    videoCallState.closeVideoCall();
                    // videoCallState.isConfirmingClose = true;
                    // videoCallState.update();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Icon(
                    Icons.close,
                    color: Colors.white,
                  ),
                )
              else
                ElevatedButton(
                  onPressed: () {
                    print("hit end");
                    videoCallState.closeVideoCall();
                    // videoCallState.isConfirmingClose = false;
                    // videoCallState.update();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Text(
                    "End Call",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }
}
