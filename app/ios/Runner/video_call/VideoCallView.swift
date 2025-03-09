import SwiftUI
import WebRTC

import SwiftUI
import WebRTC


struct VideoCallView: View {
    @ObservedObject var videoCallState = VideoCallState.shared

    var body: some View {
        VStack {
            WebRTCVideoView(videoTrack: videoCallState.localVideoTrack)
                .frame(width: 100, height: 150)
                .background(Color.black)
                .cornerRadius(8)
                .padding()
            
            if let remoteVideoTrack = videoCallState.remoteStream?.videoTracks.first {
                WebRTCVideoView(videoTrack: remoteVideoTrack)
                    .frame(width: 300, height: 400)
                    .background(Color.black)
                    .cornerRadius(8)
                    .padding()
            }

            Button(action: {
                videoCallState.closeVideoCall()
            }) {
                Text("Close")
                    .padding()
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
    }
}
