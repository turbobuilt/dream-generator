import Foundation
import WebRTC

class MyPeerConnectionDelegate: NSObject, RTCPeerConnectionDelegate {
    static var shared = MyPeerConnectionDelegate()
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {
        print("Signaling state changed: \(stateChanged)")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {
        print("Added remote stream")
        DispatchQueue.main.async {
            VideoCallState.shared.remoteStream = stream
        }
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {
        print("Removed remote stream")
        VideoCallState.shared.remoteStream = nil
    }
    
    func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {
        print("Renegotiation needed")
        if VideoCallState.shared.connectionOpen {
            print("renegotiating sdp")
            VideoCallState.shared.sendSdpOffer(renegotiation: true)
        } else {
            print("Error - tried renegotiating but connection wasn't open")
        }
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {
        if newState == .failed || newState == .closed {
            VideoCallState.shared.closeVideoCall()
        }
        print("ICE connection state changed: \(newState)")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {
        print("ICE gathering state changed: \(newState)")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {
        print("Generated ICE candidate")
        
        // Send candidate to the server
        let candidateInfo: [String: Any] = [
            "candidate": candidate.sdp,
            "sdpMid": candidate.sdpMid ?? "",
            "sdpMLineIndex": candidate.sdpMLineIndex
        ]
        if (VideoCallState.shared.connectionOpen) {
            print("sending ice candidate b/c connection open")
            VideoCallState.shared.sendIceCandidate(candidateInfo: candidateInfo)
        } else {
            print("saving ice candidate for later")
            VideoCallState.shared.iceCandidateBuffer.append(candidateInfo)
        }
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {
        print("Removed ICE candidates")
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {
        print("Data channel opened: \(dataChannel.label)")
        // Handle data channel open event
    }
}
