import 'package:dev/views/video_view/components/control_buttons.dart';
import 'package:dev/views/video_view/components/incoming_call_notification.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:provider/provider.dart';
import 'video_call_state.dart';

class VideoCall extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      var height = MediaQuery.of(context).size.height;
      var width = MediaQuery.of(context).size.width;
      var padding = MediaQuery.of(context).padding;
      double topBarHeight = 50;
      return ChangeNotifierProvider.value(
        value: videoCallState,
        child: Consumer<VideoCallState>(
          builder: (context, state, child) {
            if (state.incomingCalls.isNotEmpty) {
              return Align(
                alignment: Alignment.topCenter,
                child: IncomingCallNotification(call: state.incomingCalls.first),
              );
            }
            if (state.localStream == null && !state.showingRemoteVideo) return const SizedBox.shrink();
            return Stack(
              fit: StackFit.expand,
              children: [
                if (state.showingRemoteVideo) ...{
                  if (state.remoteRenderer != null)
                    Positioned.fill(
                      child: RTCVideoView(
                        state.remoteRenderer!,
                        objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                      ),
                    ),
                  if (state.remoteAudioRenderer != null)
                    SizedBox(
                      height: 0,
                      width: 0,
                      child: RTCVideoView(
                        state.remoteAudioRenderer!,
                        objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                      ),
                    ),
                },
                Positioned(
                  top: padding.top + 5,
                  height: topBarHeight,
                  width: width - 10,
                  left: 5,
                  // width: double.infinity,
                  child: const VideoChatControlButtons(),
                ),
                if (state.localStream != null && state.localRenderer != null && state.showingLocalVideo) ...{
                  Positioned(
                    bottom: state.bottom + padding.bottom,
                    right: state.right + padding.right,
                    width: state.width,
                    height: state.height,
                    child: GestureDetector(
                      behavior: HitTestBehavior.translucent,
                      // on move update the position of the local video
                      onPanUpdate: (details) {
                        state.bottom -= details.delta.dy;
                        state.right -= details.delta.dx;
                        if (state.bottom < 5) state.bottom = 5;
                        if (state.right < 5) state.right = 5;
                        var maxBottom = height - padding.bottom - padding.top - state.height - 5 - topBarHeight - 10;
                        if (state.bottom > maxBottom) state.bottom = maxBottom;
                        var maxRight = width - padding.right - padding.left - state.width - 5;
                        if (state.right > maxRight) state.right = maxRight;
                        state.update();
                      },
                      child: Container(
                        height: state.height,
                        width: state.width,
                        // border radius
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        // overflow hiden
                        clipBehavior: Clip.hardEdge,
                        child: RTCVideoView(
                          state.localRenderer!,
                          objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                        ),
                      ),
                    ),
                  ),
                },
                // Text('Video Call Statuses: ${state.status}'),
              ],
            );
          },
        ),
      );
    });
  }
}
