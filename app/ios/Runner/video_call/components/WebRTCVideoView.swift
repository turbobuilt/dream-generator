//
//  WebRTCVideoView.swift
//  Runner
//
//  Created by Dev on 9/15/24.
//

import Foundation
import WebRTC
import SwiftUI

struct WebRTCVideoView: UIViewRepresentable {
    var mediaStream: RTCMediaStream?
    var videoTrack: RTCVideoTrack?
    var audioTrack: RTCAudioTrack?

    func makeUIView(context: Context) -> RTCMTLVideoView {
        let videoView = RTCMTLVideoView()
        videoView.videoContentMode = .scaleAspectFill
        return videoView
    }

    func updateUIView(_ uiView: RTCMTLVideoView, context: Context) {
        if let videoTrack = videoTrack {
            print("add video track to view")
            videoTrack.add(uiView)
        } else {
            print("no video track to add")
            uiView.renderFrame(nil)
        }
    }
    
    func dismantleUIView(_ uiView: RTCMTLVideoView, coordinator: Coordinator) {
        if let videoTrack = videoTrack {
            print("removing video track from view")
            videoTrack.remove(uiView)  // Clean up the video track from the view
        }
    }
}
