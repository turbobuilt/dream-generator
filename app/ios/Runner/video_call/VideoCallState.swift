// VideoCallState.swift
// converting from dart/flutter to swift

import Foundation
import WebRTC
import flutter_callkit_incoming

enum VideoCallStatus {
    case idle
    case calling
    case ringing
    case connected
    case disconnected
}

class VideoCallState: NSObject, ObservableObject {
    static var shared = VideoCallState()
    var connection: RTCPeerConnection?
    var showingLocalVideo = false
    var showingRemoteVideo = false
    var status = VideoCallStatus.idle
    var incomingCalls = [Any]()
    var currentVideoChat: ActiveVideoChat?
    var bottom = 5
    var right = 5
    var sizeFactor = 180
    var isConfirmingClose = false
    var isConfirmingTimer: Timer? = nil
    var starting = false
    var ringTimer: Timer?
    var remoteDescriptionSet = false
    var connectionFactory: RTCPeerConnectionFactory?
    var videoCapturer: RTCCameraVideoCapturer?
    var peerConnectionFactory = RTCPeerConnectionFactory()
    var localVideoSource: RTCVideoSource?
    var localVideoTrack: RTCVideoTrack?
    var iceCandidateBuffer: [[String: Any]] = []
    var connectionOpen = false
    var localAudioSource: RTCAudioSource?
    var localAudioTrack: RTCAudioTrack?
    var currentCallData: flutter_callkit_incoming.Data?

    @Published var remoteStream: RTCMediaStream?

    func initializePeerConnection() {
        let configuration = RTCConfiguration()
        configuration.iceServers = [RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])]
        connectionFactory = RTCPeerConnectionFactory()
        let connection = connectionFactory?.peerConnection(with: configuration, constraints: RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil), delegate: MyPeerConnectionDelegate.shared)
        self.connection = connection!
    }

    func endVideoChatReceived(data: [String: [String: Any]]) {
        let callRoom = data["callRoom"]!
        let callRoomId = callRoom["id"] as! Int
        if currentVideoChat?.callRoom?.id == callRoomId {
            closeVideoCall()
        }
    }

    func closeVideoCall() {
        if connection == nil {
            return
        }
        DispatchQueue.main.async {
            let appDelegate = UIApplication.shared.delegate as! AppDelegate
            appDelegate.closeWebRTCView()
            let con = self.connection
            self.connection = nil
            con?.close()
            SwiftFlutterCallkitIncomingPlugin.sharedInstance?.endCall(self.currentCallData!)
            if self.currentVideoChat != nil {
                callMethod(name: "postEndVideoChat", args: [
                    ["callRoomId": self.currentVideoChat!.callRoom?.id]
                ], completion: { result in
                    print("result of end video chat \(result)")
                })
                self.currentVideoChat = nil
            }
            
            self.localAudioTrack?.isEnabled = false
            self.localVideoTrack?.isEnabled = false
            if let remoteVideoTrack = self.remoteStream?.videoTracks.first {
                remoteVideoTrack.isEnabled = false
            }

            self.showingLocalVideo = false
            self.showingRemoteVideo = false
            self.connection = nil
            self.remoteStream = nil
            self.iceCandidateBuffer = []
            self.remoteDescriptionSet = false
            self.isConfirmingClose = false
            self.iceCandidateBuffer = []
            self.connectionOpen = false
            self.localAudioSource = nil
            self.localAudioTrack = nil
            self.localVideoTrack = nil
            self.localVideoSource = nil
            self.currentCallData = nil
        }
    }
    
    func videoChatCallRequest(eventResponse: [String: Any]) {
        let data = eventResponse["data"] as! [String: Any]
        print("video chat call request")
        incomingCalls.append(data)
    }
    
    func videoChatSdpOffer(eventResponse: [String: Any]) {
        ringTimer?.invalidate()
        ringTimer = nil
        let data = eventResponse["data"] as! [String: Any]
        let sdp = data["sdp"] as! [String: Any]
        setSdp(sdp: sdp)
    }
    
    func setSdp(sdp: [String: Any]) {
        let remoteDescription = RTCSessionDescription(type: RTCSdpType.toType(typeString: sdp["type"] as! String)!, sdp: sdp["sdp"] as! String)
        connection!.setRemoteDescription(remoteDescription, completionHandler: { [self] error in
            if let error = error {
                print("Failed to set remote description: \(error)")
                return
            }
            print("set remote description successfully")
//            self.connection?.answer(for: RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil), completionHandler: { answer, error in
//                if let error = error {
//                    print("Failed to create answer: \(error)")
//                    return
//                }
//                guard let answer = answer else { return }
//                self.connection?.setLocalDescription(answer, completionHandler: { error in
//                    if let error = error {
//                        print("Failed to set local description: \(error)")
//                        return
//                    }
//                    
//                    callMethod(name: "postCallRoomAnswer", args: [["sdp": answer.toMap()], currentVideoChat?.callRoom?.id], completion: { result in
//                        print("post call room answer result", result)
//                    })
//                })
//            })
        })
    }

    func videoChatSdpAnswer(eventResponse: [String: Any]) {
        let data = eventResponse["data"] as! [String: Any]
        iceCandidateBuffer = []
        let sdp = data["sdp"] as! [String: Any]
        let remoteDescription = RTCSessionDescription(type: RTCSdpType.toType(typeString: sdp["type"] as! String)!, sdp: sdp["sdp"] as! String)
        connection?.setRemoteDescription(remoteDescription, completionHandler: { error in
            if let error = error {
                print("Failed to set remote description: \(error)")
                return
            }
            self.remoteDescriptionSet = true
            if !self.iceCandidateBuffer.isEmpty {
                for notification in self.iceCandidateBuffer {
                    self.iceCandidate(eventResponse: notification)
                }
            }
        })
    }

    func videoChatCallAnswer(eventResponse: [String: Any]) {
        print("got video chat call answer")
    }

    func iceCandidate(eventResponse: [String: Any]) {
        print("got ice candidate")
         let data = eventResponse["data"] as! [String: Any]
        let candidateInfo = data["candidate"] as! [String: Any]
        let candidate = RTCIceCandidate(sdp: candidateInfo["candidate"] as! String, sdpMLineIndex: candidateInfo["sdpMLineIndex"] as! Int32, sdpMid: candidateInfo["sdpMid"] as? String)
        if connection != nil {
            print("adding ice candidate")
            connection?.add(candidate)
        } else {
            print("error adding ice candidate because connection is nil")
        }
    }

    func videoChatReject(call: [String: Any]) {
        var callRoom = call["callRoom"] as! [String: Any]
        callMethod(name: "postEndVideoChat", args: [
            ["callRoomId": callRoom["id"]]
        ], completion: { result in
            print("result of end video chat \(result)")
        })
        // incomingCalls.removeAll(where: { $0 as! [String: Any] == call })
        // remove by call room id
        incomingCalls.removeAll(where: { ($0 as! [String: [String: Any]])["callRoom"]?["id"] as! Int == callRoom["id"] as! Int })
    }

    func getLocalStream() {
        self.localVideoSource = peerConnectionFactory.videoSource()
        self.videoCapturer = RTCCameraVideoCapturer(delegate: self.localVideoSource!)
        self.localVideoTrack = peerConnectionFactory.videoTrack(with: self.localVideoSource!, trackId: "localVideoTrack")
        
        self.localAudioSource = peerConnectionFactory.audioSource(with: RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil))
        self.localAudioTrack = peerConnectionFactory.audioTrack(with: localAudioSource!, trackId: "localAudioTrack")

        guard
            let frontCamera = (RTCCameraVideoCapturer.captureDevices().first { $0.position == .front }),
        
            // choose highest res
            let format = (RTCCameraVideoCapturer.supportedFormats(for: frontCamera).sorted { (f1, f2) -> Bool in
                let width1 = CMVideoFormatDescriptionGetDimensions(f1.formatDescription).width
                let width2 = CMVideoFormatDescriptionGetDimensions(f2.formatDescription).width
                return width1 < width2
            }).last,
        
            // choose highest fps
            let fps = (format.videoSupportedFrameRateRanges.sorted { return $0.maxFrameRate < $1.maxFrameRate }.last) else {
            return
        }
        
        self.videoCapturer!.startCapture(with: frontCamera, format: format, fps: Int(fps.maxFrameRate))
        
        showingLocalVideo = true
    }

    // to receive a call, you initiate a WebRTC session
    func receiveCall(incomingCall: [String: Any]) {
        print("receiving call")
        // incomingCalls.removeAll(where: { $0 as! [String: Any] == incomingCall })
        let callRoomData = incomingCall["callRoom"] as! [String: Any]
        incomingCalls.removeAll(where: { ($0 as! [String: [String: Any]])["callRoom"]?["id"] as! Int == callRoomData["id"] as! Int })
        // incomingCall["users"] is [{id: 1}, {id: 2}]
        let usersData = incomingCall["users"] as! [[String: Any]]
        // get list of ids as int
        let recipients = usersData.map({ user in user["id"] as! Int })
        
        currentVideoChat = ActiveVideoChat.createFromMap(json: [
            "callRoom": incomingCall["callRoom"]!,
            "recipients": recipients,
            "originator": incomingCall["originator"]!,
            "active": true
        ])
        iceCandidateBuffer = []
        
        showingLocalVideo = true
        initializePeerConnection()
        getLocalStream()
        sendSdpOffer()
    }
    
    func sendSdpOffer(renegotiation: Bool = false) {
        let offer = self.connection?.offer(for: RTCMediaConstraints(mandatoryConstraints: nil, optionalConstraints: nil), completionHandler: { offer, error in
            if let error = error {
                print("Failed to create offer: \(error)")
                return
            }
            guard let offer = offer else { return }
            self.connection?.setLocalDescription(offer, completionHandler: { error in
                if let error = error {
                    print("Failed to set local description: \(error)")
                    return
                }
                callMethod(name: "postVideoChatSdpOffer", args: [
                    ["callRoomId": self.currentVideoChat!.callRoom?.id, "authenticatedUserIds": self.currentVideoChat!.recipients, "sdp": offer.toMap(), "renegotiation": renegotiation]
                ], completion: { result in
                    if let result = result.data as? [String: Any] {
                        if self.currentVideoChat == nil {
                            self.currentVideoChat = ActiveVideoChat.createFromMap(json: result)
                        } else {
                            self.currentVideoChat?.callRoom = CallRoom.createFromMap(json: result["callRoom"] as! [String : Any])
                            self.currentVideoChat?.recipients = result["users"] as! [Int]
                        }
                        print("entered video call room and did postVideoChatSdpOffer", result)
                        self.connectionOpen = true
                        if self.iceCandidateBuffer.count > 0 {
                            for candidate in self.iceCandidateBuffer {
                                self.sendIceCandidate(candidateInfo: candidate)
                            }
                            self.iceCandidateBuffer = []
                        }
                        if renegotiation == false {
                            print("adding local video track")
                            self.connection!.add(self.localVideoTrack!, streamIds: ["localVideoStream"])
                            self.connection!.add(self.localAudioTrack!, streamIds: ["localAudioStream"])

                        }
                    }
                })
            })
        })
    }

    func startCall(recipients: [Int]) {
        if starting {
            return
        }
        starting = true
        getLocalStream()
        callMethod(name: "postManageCallRoom", args: [
            ["callRoomId": nil, "authenticatedUserIds": recipients, "sdp": nil]
        ], completion: { result in
            let data = result.data as! [String: Any?]
            if self.currentVideoChat == nil {
                self.currentVideoChat = ActiveVideoChat.createFromMap(json: data["users"] as! [String: Any])
            } else {
                self.currentVideoChat?.callRoom = CallRoom.createFromMap(json: data["callRoom"] as! [String: Any])
                self.currentVideoChat?.recipients = data["users"] as! [Int]
            }
            self.ringTimer = Timer.scheduledTimer(withTimeInterval: 25, repeats: false, block: { _ in
                self.closeVideoCall()
            })
        })
        starting = false
    }
    
    func sendIceCandidate(candidateInfo: [String: Any]) {
        callMethod(name: "postIceCandidate", args: [[
            "candidate": candidateInfo,
            "callRoomId":  VideoCallState.shared.currentVideoChat?.callRoom?.id! as Any,
            "sdp": VideoCallState.shared.connection?.localDescription?.toMap() as Any
        ]]) { result in
            print("post ice candidate result", result)
        }
    }
}
