import 'dart:async';

import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/views/video_view/components/active_video_chat.dart';
import 'package:dev/views/video_view/components/incoming_call.dart';
import 'package:dev/views/video_view/video_call.dart';
import 'package:flutter_callkit_incoming/flutter_callkit_incoming.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';

enum VideoCallStatus {
  idle,
  calling,
  ringing,
  connected,
  disconnected,
}

ClientVideoChatData? currentVideoCall;

class ClientVideoChatData {
  var remoteVideoPromises = [];
  RTCPeerConnection? connection;
  RTCSessionDescription? remoteDescription;
  var incomingIceCandidates = [];
  var localSdpId = 0;
  var localAppliedSdpId = 0;
  var remoteSdpId = 0;
  // MediaStream? localStream;
  var localStreamAttachedToConnection = false;
  RTCSessionDescription? currentOffer;
  RTCSessionDescription? currentAnswer;
  String? uuid;
  CallRoom? callRoom;
  List<dynamic> bufferedIceCandidates = [];

  constructor() {
    uuid = Uuid().v4();
  }

  sendSdpOffer() async {
    currentOffer = await connection?.createOffer();
    localSdpId += 1;

    var result = callMethod("postVideoChatSdpOffer", [
      {"callRoomId": callRoom?.id, "offer": currentOffer?.toMap(), "sdpId": localSdpId}
    ]);
    return result;
  }

  sendSdpAnswer() async {
    localSdpId += 1;
    var answer = await currentVideoCall?.connection?.createAnswer();
    await currentVideoCall?.connection?.setLocalDescription(answer!);
    var result = await callMethod("postVideoChatSdpAnswer", [
      {"answer": answer?.toMap(), "callRoomId": callRoom?.id, "sdpId": localSdpId, "remoteSdpId": remoteSdpId}
    ]);
    if (showHttpErrorIfExists(result)) {
      return;
    }
  }

  trySetRemoteDescription(MediaStream localStream, sdp, targetSdpId, remoteSdpId) async {
    print("trying to set remote description for sdpId $targetSdpId remoteSdpId $remoteSdpId");
    print("current sdp id ${currentVideoCall?.localSdpId}, current remot sdp ${currentVideoCall?.remoteSdpId}");
    if (localSdpId == targetSdpId && currentVideoCall!.remoteSdpId < remoteSdpId) {
      if (currentVideoCall?.currentOffer != null) {
        print(">>>>>>> setting current offer");
        currentVideoCall?.connection?.setLocalDescription(currentVideoCall!.currentOffer!);
        currentVideoCall?.currentOffer = null;
      }
      currentVideoCall?.remoteSdpId = remoteSdpId;
      currentVideoCall?.remoteDescription = RTCSessionDescription(sdp["sdp"], sdp["type"]);
      print("setting remote description");
      currentVideoCall?.connection?.setRemoteDescription(currentVideoCall!.remoteDescription!).catchError((error) => {
            print("error setting remote description in videoChatSdpAnswer"),
            showAlert("Error setting remote description in videoChatSdpAnswer: $error")
          });
      if (currentVideoCall?.localStreamAttachedToConnection == false) {
        print("ATTACHING LOCAL STREAM");
        currentVideoCall?.attachLocalStreamToConnection(localStream);
      }
      if (currentVideoCall?.bufferedIceCandidates.isNotEmpty == true) {
        for (var i = 0; i < (currentVideoCall?.bufferedIceCandidates.length ?? 0); ++i) {
          var data = currentVideoCall?.bufferedIceCandidates[i];
          currentVideoCall?.bufferedIceCandidates.removeAt(i);
          i--;
          print("trying to add buffered candidate");
          tryAddIceCandidate(data);
        }
      }
    }
  }

  tryAddIceCandidate(data) async {
    if (currentVideoCall?.localSdpId == data.remoteSdpId) {
      print('will add cancdidate');
      var candidate = RTCIceCandidate(
        data['candidate']['candidate'],
        data['candidate']['sdpMid'],
        data['candidate']['sdpMLineIndex'],
      );
      currentVideoCall?.connection?.addCandidate(candidate).catchError((error) => {print("Error adding ice candidate")});
    } else {
      print("will skip candidate");
    }
  }

  attachLocalStreamToConnection(localStream) {
    localStreamAttachedToConnection = true;
    var tracks = localStream?.getTracks();
    for (var i = 0; i < (tracks?.length ?? 0); i++) {
      print("Adding track $i ${tracks[i]}");
      connection?.addTrack(tracks![i], localStream!);
    }
  }

  close() {
    remoteDescription = null;
    incomingIceCandidates = [];
    localStreamAttachedToConnection = false;
    localSdpId = 0;
    remoteSdpId = 0;
    currentAnswer = null;
    currentOffer = null;
    bufferedIceCandidates = [];
    if (connection != null) {
      connection?.onAddTrack = null;
      // @ts-ignore
      connection?.onRemoveTrack = null;
      // @ts-ignore
      connection?.onRemoveStream = null;
      connection?.onIceCandidate = null;
      connection?.onIceConnectionState = null;
      connection?.onSignalingState = null;
      connection?.onIceGatheringState = null;
      connection?.onRenegotiationNeeded = null;
      connection?.close();
      connection = null;
    }
  }
}

class VideoCallState extends ChangeNotifier {
  // RTCPeerConnection? connection;
  MediaStream? localStream;
  MediaStream? remoteStream;
  MediaStream? remoteAudioStream;
  RTCVideoRenderer? localRenderer;
  RTCVideoRenderer? remoteRenderer;
  RTCVideoRenderer? remoteAudioRenderer;
  bool showingLocalVideo = false;
  bool showingRemoteVideo = false;
  VideoCallStatus status = VideoCallStatus.idle;
  List<dynamic> incomingCalls = [];
  ActiveVideoChat? currentVideoChat;
  double bottom = 5;
  double right = 5;
  double sizeFactor = 180;
  bool isConfirmingClose = false;
  Timer? isConfirmingTimer = null;
  bool starting = false;
  Timer? ringTimer;
  bool localTracksAdded = false;
  String? currentCallkitId;

  update() {
    notifyListeners();
  }

  get width {
    return (localRenderer?.value.aspectRatio ?? 0) * sizeFactor;
  }

  get height {
    return 1 / (localRenderer?.value.aspectRatio ?? 1) * sizeFactor;
  }

  initializePeerConnection(ClientVideoChatData clientVideoChatData) async {
    var connection = await createPeerConnection({
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
        {'urls': "stun:stun4.l.google.com:5349"},
      ]
    });

    connection.onIceCandidate = (RTCIceCandidate candidate) async {
      print("ICE CANDIDATE");
      // print("got ice candidate $candidate");
      callMethod('postIceCandidate', [
        {
          "callRoomId": clientVideoChatData.callRoom?.id,
          "candidate": candidate.toMap(),
          "sdp": (await connection.getLocalDescription())?.toMap(),
          "sdpId": clientVideoChatData.localSdpId,
          "remoteSdpId": clientVideoChatData.remoteSdpId
        }
      ]).onError((error, stackTrace) => showAlert("Error sending ice candidate"));
    };

    connection.onRenegotiationNeeded = () async {
      print("renegotiation needed");
      try {
        await currentVideoCall!.sendSdpOffer();
      } catch (err, stackTrace) {
        print("Error in on renegotiation needed");
        print(err);
        print(stackTrace);
      }
    };

    connection.onIceConnectionState = (RTCIceConnectionState state) {
      if (state == RTCIceConnectionState.RTCIceConnectionStateFailed || state == RTCIceConnectionState.RTCIceConnectionStateClosed) {
        closeVideoCall();
      }
    };
    connection.onIceGatheringState = (RTCIceGatheringState state) {
      print("ICE gathering state: $state");
      if (state == RTCIceGatheringState.RTCIceGatheringStateComplete) {
        print("ICE gathering complete");
      }
    };
    connection.onSignalingState = (RTCSignalingState state) {
      print("Signaling state: $state");
    };

    connection.onTrack = (RTCTrackEvent event) async {
      print("will be adding track $event");
      // for (var stream in  event.streams) {
      if (event.track.kind == "video") {
        remoteStream = event.streams[0];
        // remoteRenderer!.setSrcObject(stream: event.streams[0], trackId: "remote" + event.track.kind.toString())
        remoteRenderer!.srcObject = remoteStream;
        showingRemoteVideo = true;
      } else if (event.track.kind == "audio") {
        remoteAudioRenderer!.srcObject = event.streams[0];
        remoteAudioStream = event.streams[0];
      }
      // }
      notifyListeners();
    };
    print("connection initialized");
    clientVideoChatData.connection = connection;
    return connection;
  }

  endVideoChatReceived(Map data) {
    var callRoomId = data['data']?['callRoom']?['id'];
    print("call room id is $callRoomId");
    if (currentVideoChat?.callRoom?.id == callRoomId) {
      closeVideoCall();
    }
  }

  startCall(List recipients) async {
    print("will try to connect");
    if (starting) return;
    try {
      starting = true;
      currentVideoCall?.close();
      currentVideoCall = ClientVideoChatData();
      localStream = await getLocalStream();
      initPlayers();
      var result = await callMethod('postCreateCallRoom', [
        {
          "callRoomId": null,
          "authenticatedUserIds": recipients,
        }
      ]);
      print("result is $result");
      if (showHttpErrorIfExists(result)) {
        closeVideoCall();
        return;
      }
      currentVideoChat = ActiveVideoChat.createFromMap({
        'callRoom': result['callRoom'],
        'recipients': result['users'].map((user) => user['id']),
        'originator': result['originator'],
        'active': false,
      });
      // currentVideoChat = ActiveVideoChat.createFromMap({'recipients': result['users'], 'callRoom': result['callRoom']});
      currentVideoCall?.callRoom = currentVideoChat?.callRoom;
      notifyListeners();
      ringTimer = Timer(const Duration(seconds: 25), () {
        closeVideoCall();
      });
    } catch (err, stackTrace) {
      print("Error starting video call");
      print(err);
      print(stackTrace);
      showAlert("Error starting video call");
      return;
    } finally {
      starting = false;
    }
  }

  void closeVideoCall({String? callkitId}) async {
    if (currentVideoCall == null) {
      return;
    }
    var call = currentVideoCall;
    currentVideoCall = null;
    call?.close();

    showingLocalVideo = false;
    showingRemoteVideo = false;
    localStream?.dispose();
    localStream = null;
    remoteStream?.dispose();
    remoteStream = null;
    remoteAudioStream?.dispose();
    remoteAudioStream = null;
    localRenderer?.dispose();
    localRenderer = null;
    remoteRenderer?.dispose();
    remoteRenderer = null;
    remoteAudioRenderer?.dispose();
    remoteAudioRenderer = null;
    iceCandidateNotifications = [];
    remoteDescriptionSet = false;
    isConfirmingClose = false;
    localTracksAdded = false;
    if (callkitId != null || currentCallkitId != null) {
      FlutterCallkitIncoming.endCall(currentCallkitId ?? callkitId ?? "").catchError((error) => print("error"));
    }
    if (currentVideoChat != null) {
      var result = await callMethod('postEndVideoChat', [
        {"callRoomId": currentVideoChat!.callRoom?.id}
      ]);
      print("result of end video chat $result");
      currentVideoChat = null;
    }
    notifyListeners();
  }

  rejectCall(incomingCall) async {
    await callMethod("postEndVideoChat", [
      {"callRoomId": incomingCall.callRoom.id}
    ]);
    print("incoming call $incomingCall");
    incomingCalls.remove(incomingCall);
  }

  void videoChatCallRequest(Map<String, dynamic> eventResponse) {
    var data = eventResponse['data'];
    print("video chat call request");
    incomingCalls.add(data);
    notifyListeners();
  }

  void videoChatSdpOffer(Map<String, dynamic> eventResponse) async {
    print("got video chat sdp offer");
    // return;
    ringTimer?.cancel();
    ringTimer = null;
    var data = eventResponse['data'];
    print("received video chat sdp offer");
    if (currentVideoCall == null) {
      print("not doing anything with sdp offer since current video cal is null");
      return;
    }
    if (currentVideoCall!.remoteSdpId < currentVideoCall!.localSdpId) {
      print("not doing negotiation because haven't received answer yet");
      return;
    }
    if (currentVideoCall?.connection == null) {
      print("must make connection receiving sdp offer");
      await initializePeerConnection(currentVideoCall!);
    }
    if (data["sdpId"] > currentVideoCall!.remoteSdpId) {
      currentVideoCall!.remoteSdpId = data["sdpId"];
      currentVideoCall!.remoteDescription = RTCSessionDescription(data["offer"]["sdp"], data["offer"]["type"]);
      currentVideoCall!.connection!.setRemoteDescription(currentVideoCall!.remoteDescription!);
      currentVideoCall!.sendSdpAnswer();
    }
    if (currentVideoCall?.localStreamAttachedToConnection == false) {
      currentVideoCall!.attachLocalStreamToConnection(localStream);
    }

    await initPlayers();
  }

  var remoteDescriptionSet = false;
  List<Map<String, dynamic>> iceCandidateNotifications = [];
  void videoChatSdpAnswer(Map<String, dynamic> eventResponse) async {
    print("GOT ANSWER");
    var data = eventResponse['data'];
    print("video chat sdp answer");
    currentVideoCall?.trySetRemoteDescription(localStream!, data["answer"], data["remoteSdpId"], data["sdpId"]);
  }

  void videoChatCallAnswer(Map<String, dynamic> eventResponse) async {
    print("got video chat call answer");
    throw UnimplementedError();
  }

  void iceCandidate(Map<String, dynamic> eventResponse) async {
    print("ICE CANDIDATE");
    try {
      if (!remoteDescriptionSet) {
        iceCandidateNotifications.add(eventResponse);
        return;
      }

      var data = eventResponse['data'];

      print("got ice candidate, adding to connection");
      if (currentVideoCall == null || currentVideoCall?.callRoom?.id != data["callRoom"]["id"]) {
        currentVideoCall?.close();
        currentVideoCall = ClientVideoChatData();
        await initializePeerConnection(currentVideoCall!);
      }
      if (currentVideoCall!.remoteSdpId < data["sdpId"]) {
        currentVideoCall!.bufferedIceCandidates.add(data);
        return;
      }
      if (!currentVideoCall!.localStreamAttachedToConnection) {
        currentVideoCall!.attachLocalStreamToConnection(localStream);
      }
      currentVideoCall!.tryAddIceCandidate(data);

      // wait one second
      await Future.delayed(const Duration(seconds: 1));
      print("Done waiting!");
    } catch (err, stackTrace) {
      print("Error in ice candidate");
      print(err);
      print(stackTrace);
    }
  }

  void videoChatReject(Map call) {
    closeVideoCall();
    print("rejecting call $call");
    callMethod("postEndVideoChat", [
      {"callRoomId": call["callRoom"]["id"]}
    ]);
    incomingCalls.remove(call);
    notifyListeners();
  }

  getLocalStream() async {
    var stream = await navigator.mediaDevices.getUserMedia({
      'video': {
        'mandatory': {
          'minWidth': '640', // Provide your own width, height and frame rate here
          'minHeight': '480',
          'minFrameRate': '15',
        },
        'facingMode': 'user',
        'optional': [],
      },
      'audio': true,
    });
    showingLocalVideo = true;
    notifyListeners();
    return stream;
  }

  initPlayers() async {
    if (localRenderer == null) {
      var tempLocalRenderer = RTCVideoRenderer();
      var tempRemoteRenderer = RTCVideoRenderer();
      var tempRemoteAudioRenderer = RTCVideoRenderer();
      Helper.setSpeakerphoneOn(true);
      await Future.wait([
        tempLocalRenderer.initialize(),
        tempRemoteRenderer.initialize(),
        tempRemoteAudioRenderer.initialize(),
      ]);
      localRenderer = tempLocalRenderer;
      remoteRenderer = tempRemoteRenderer;
      remoteAudioRenderer = tempRemoteAudioRenderer;
    }
    localRenderer?.srcObject = localStream;
  }

  void receiveCall(Map incomingCall, {String? callkitId}) async {
    print("receiving call $incomingCall");
    // close keyboard if visible
    FocusManager.instance.primaryFocus?.unfocus();

    currentCallkitId = callkitId;
    currentVideoCall?.close();
    currentVideoCall = ClientVideoChatData();

    incomingCalls.remove(incomingCall);
    print("receiving call $incomingCall");

    currentVideoChat = ActiveVideoChat.createFromMap({
      'callRoom': incomingCall['callRoom'],
      'recipients': incomingCall['users'].map((user) => user['id']),
      'originator': incomingCall['originator'],
      'active': true,
    });
    currentVideoCall?.callRoom = currentVideoChat?.callRoom;
    print("current video chat $currentVideoChat");
    notifyListeners();

    await initializePeerConnection(currentVideoCall!);
    showingLocalVideo = true;
    localStream = await getLocalStream();
    await initPlayers();
    var result = await currentVideoCall?.sendSdpOffer();
    if (showHttpErrorIfExists(result)) {
      closeVideoCall();
      return;
    }
    notifyListeners();
  }
}

var videoCallState = VideoCallState();
