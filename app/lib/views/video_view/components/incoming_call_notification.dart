
import 'package:dev/views/video_view/components/incoming_call.dart';
import 'package:dev/views/video_view/video_call.dart';
import 'package:dev/views/video_view/video_call_state.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class IncomingCallNotification extends StatelessWidget {
  final Map call;

  const IncomingCallNotification({required this.call});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<VideoCallState>(context, listen: false);

    return SafeArea(
      top: true,
      left: true,
      right: true,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Container(
          padding: const EdgeInsets.all(10),
          margin: const EdgeInsets.symmetric(vertical: 5),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.5),
                blurRadius: 10,
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Incoming Video Call', style: TextStyle(fontSize: 16, color: Colors.black)),
              const SizedBox(height: 10),
              Text(call["originator"]["userName"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black)),
              const SizedBox(height: 10),
              DefaultTextStyle(
                style: const TextStyle(color: Colors.black, fontSize: 14),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          videoCallState.receiveCall(call);
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                        child: const Icon(Icons.phone, color: Colors.white,),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          state.videoChatReject(call);
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        child: const Icon(Icons.close, color: Colors.white,),
                      ),
                      // ElevatedButton(
                      //   onPressed: () {
                      //     call["silenced"] = true;
                      //   },
                      //   style: ElevatedButton.styleFrom(backgroundColor: Colors.grey),
                      //   child: const Icon(Icons.volume_off, color: Colors.white,),
                      // ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}