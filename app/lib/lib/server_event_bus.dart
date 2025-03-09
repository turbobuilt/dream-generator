//@ts-ignore

// ignore_for_file: empty_catches

import 'dart:async';
import 'dart:convert';
import 'dart:ffi';
import 'dart:io';
import 'dart:typed_data';

import 'package:dev/main.dart';
import 'package:dev/views/chat_page/chat_page_state.dart';
import 'package:dev/views/notifications_view/notifications_state.dart';
import 'package:dev/views/video_view/video_call_state.dart';
import 'package:dio/dio.dart';
import 'package:fetch_client/fetch_client.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart';
import 'package:notification_permissions/notification_permissions.dart';
import 'package:uuid/uuid.dart';
import 'package:uuid/v4.dart';

class ServerEventBus {}

const uuid = Uuid();
var sseOrigin = //"https://api.dreamgenerator.ai";
    kReleaseMode ? "https://live.dreamgenerator.ai" : apiOrigin;
var sseUrl = "$sseOrigin/api/post-subscribe-to-notifications";

parseSSEMessage(String message) {
  var lines = message.split('\n');
  String? event;
  var data = '';

  for (var line in lines) {
    if (line.startsWith('event:')) {
      event = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      data += '${line.substring(5).trim()}\n';
    }
  }
  return {'event': event, 'data': data.trim()};
  // return { event, data: data.trim() };
}

class EventSourceConnection {
  int created = DateTime.now().millisecondsSinceEpoch;
  String token;
  Map<String, EventRegistration> events;
  Function onMessage;
  Function onConnected;
  Function onError;
  CancelToken controller = CancelToken();
  Map options = {};
  Map<String, dynamic> headers = {};

  EventSourceConnection(
      {required this.token, required this.events, required this.onMessage, required this.onConnected, required this.onError}) {
    created = DateTime.now().millisecondsSinceEpoch;

    // var headers = {};
    headers["Accept"] = "text/event-stream";
    headers["authorizationtoken"] = globalStore.userToken;
    headers["Content-Type"] = "application/json";
    options = {};
    options['headers'] = headers;
  }

  kill() async {
    try {
      onError = () => {};
      controller.cancel();
    } catch (err) {}
  }

  connect() async {
    final completer = Completer<void>();
    try {
      // final completer = Completer<void>();
      // convert to dart/flutter

      final dio = Dio();
      controller = CancelToken();
      Map<String, dynamic> eventsJson = {};

      var omitVideoChatCallRequest = false;
      var permissionStatus = await NotificationPermissions.getNotificationPermissionStatus();
      if (Platform.isIOS && permissionStatus == PermissionStatus.granted) {
        omitVideoChatCallRequest = true;
      }
      for (var event in events.values) {
        if (omitVideoChatCallRequest && event.type == "videoChatCallRequest") {
          print("OMITTING videoChatCallRequest");
          continue;
        }
        eventsJson[event.guid!] = event.toMap();
      }
      print("will do requeist $sseUrl");
      var response = await dio.post<ResponseBody>(sseUrl,
          data: {
            "events": {
              sseClientId: {"clientId": sseClientId, "token": globalStore.userToken, "eventListeners": eventsJson}
            },
          } as Map<String, dynamic>,
          cancelToken: controller,
          options: Options(headers: headers, responseType: ResponseType.stream));
      print("got status ${response.statusCode}");
      if (response.statusCode != 200) {
        onError("err - not ok ${response.statusCode}");
        completer.complete();
        return;
      }
      if (response.data == null) {
        completer.complete();
        onError("err - no body");
        return;
      }
      StreamTransformer<Uint8List, List<int>> unit8Transformer = StreamTransformer.fromHandlers(
        handleData: (data, sink) {
          sink.add(List<int>.from(data));
        },
      );
      var text = "";
      response.data?.stream.transform(unit8Transformer).transform(const Utf8Decoder()).listen((textPart) {
        text += textPart;
        var boundaryIndex = text.indexOf('\n\n');
        var i = 0;
        while (boundaryIndex != -1) {
          if (i++ > 100000) {
            print("breaking");
            break;
          }
          var message = text.substring(0, boundaryIndex).trim();
          text = text.substring(boundaryIndex + 2);
          print("got sse ${text.substring(0, text.length < 20 ? text.length : 20)}...");
          var event = parseSSEMessage(message);
          // print("got sse parsed $event");
          if (event['event'] == "connected") {
            completer.complete();
            onConnected();
          } else {
            onMessage(jsonDecode(event['data']));
          }
          boundaryIndex = text.indexOf('\n\n');
        }
      }).onError((err) {
        if (!completer.isCompleted) completer.complete();
        if (err is DioException && err.type == DioExceptionType.cancel) {
          return;
        }
        onError(err);
      });
      return completer.future;
    } catch (err) {
      if (err is DioException && err.type == DioExceptionType.cancel) {
        if (!completer.isCompleted) completer.complete();
        return;
      }
      if (!completer.isCompleted) completer.complete();
      onError(err);
    }
  }
}

// this class uses "fetch" instead of EventSource, and sets the authorization header
// in the event of failed http request, timeout, or disconnect
const retryDelay = 5000;
const connectionLife = 20000;
const sseNotificationsUrl = "/api/post-subscribe-to-notifications";

class ScheduledConnection {
  Timer timeout;
  int occursAt;
  ScheduledConnection({required this.timeout, required this.occursAt});
}

var sseClientId = const Uuid().v4();

class EventRegistration {
  // String clientId = sseClientId;
  String? guid;
  String? token;
  String type;
  Map? data;
  Function handler;
  EventRegistration({required this.handler, required this.type, this.data, this.guid}) {
    // ignore: prefer_const_constructors
    guid ??= Uuid().v4();
  }

  toMap() {
    return {
      "guid": guid,
      "token": token,
      "type": type,
      "data": data,
    };
  }

  fromMap(json) {
    guid = json["guid"];
    token = json["token"];
    type = json["type"];
    data = json["data"];
  }
}

class MyEventSource {
  // ignore: prefer_const_constructors
  String id = Uuid().v4();
  String? token;
  late Map<String, EventRegistration> events = {};
  EventSourceConnection? eventSource;
  Map options = {};
  int lastConnection = 0;
  int lastTokenRefresh = DateTime.now().millisecondsSinceEpoch;
  ScheduledConnection? scheduledConnection;

  MyEventSource() {
    print("making my event source");
    var events = [
      EventRegistration(
        guid: uuid.v4(),
        type: "notification",
        handler: (data) {
          print("notification $data");
          notificationsState.notificationReceived(data["data"]["notification"]);
          // globalStore.chatState.addMessage(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "videoChatCallRequest",
        handler: (data) {
          print("videoChatCallRequest $data");
          videoCallState.videoChatCallRequest(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "endVideoChat",
        handler: (data) {
          print("endVideoChat");
          videoCallState.endVideoChatReceived(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "videoChatSdpOffer",
        handler: (data) {
          print("videoChatSdpOffer $data");
          videoCallState.videoChatSdpOffer(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "videoChatCallAnswer",
        handler: (data) {
          print("videoChatCallAnswer $data");
          videoCallState.videoChatCallAnswer(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "videoChatSdpAnswer",
        handler: (data) {
          print("videoChatSdpAnswer");
          videoCallState.videoChatSdpAnswer(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "iceCandidate",
        handler: (data) {
          print("got iceCandidate");
          videoCallState.iceCandidate(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "videoChatReject",
        handler: (data) {
          print("videoChatReject $data");
          videoCallState.videoChatReject(data);
        },
      ),
      EventRegistration(
        guid: uuid.v4(),
        type: "chatMessage",
        handler: (data) {
          print("chatMessage");
          chatPageState.chatMessageReceived(data);
          // videoCallState.videoChatBusy(data);
        },
      ),
    ];
    for (var event in events) {
      this.events[event.guid!] = event;
    }
  }

  scheduleConnection(int millis) async {
    print("scheduling connection current connection $scheduledConnection This id $this.id");
    if (scheduledConnection != null) {
      print("clearing old scheduled connection $scheduledConnection");
      scheduledConnection!.timeout.cancel();
    }
    scheduledConnection = ScheduledConnection(
        timeout: Timer(Duration(milliseconds: millis), () {
          scheduledConnection = null;
          connect();
        }),
        occursAt: DateTime.now().millisecondsSinceEpoch + millis);
  }

  stop() async {
    print("stopping sse");
    eventSource?.kill();
    scheduledConnection?.timeout.cancel();
    scheduledConnection = null;
    eventSource = null;
  }

  ensureConnected(String? token) {
    if (eventSource == null) {
      connect();
    }
  }

  Future<void> connect() async {
    print("connecting to sse");
    // Return early if there is no token
    if (globalStore.userToken == "") {
      print("no token, stopping");
      stop();
      return;
    }

    // Create a Completer to manually control when the Future is resolved
    final completer = Completer<void>();

    print("connecting ${DateTime.now().toIso8601String()} id $id");
    scheduleConnection(connectionLife);

    // Declare the EventSourceConnection
    EventSourceConnection? newEventSourceConnection;

    // Initialize the new EventSourceConnection
    newEventSourceConnection = EventSourceConnection(
      token: globalStore.userToken,
      events: events,
      onConnected: () {
        print("sse event listener connected $eventSource");
        if (eventSource != null) {
          print("aborting old connection since new connected");
          eventSource?.controller.cancel();
        }
        eventSource = newEventSourceConnection;

        // Complete the completer indicating a successful connection
        if (!completer.isCompleted) {
          completer.complete();
        }
      },
      onMessage: (data) {
        onMessage(data);
      },
      onError: (err) {
        print("error in server event bus $err");
        if (scheduledConnection != null && scheduledConnection!.occursAt < DateTime.now().millisecondsSinceEpoch + retryDelay) {
          print("reconnect already scheduled");
          // if (!completer.isCompleted) {
          //   completer.completeError(err);
          // }
          return;
        } else {
          print("will reconnect in ${retryDelay / 1000} seconds");
          scheduleConnection(retryDelay);
        }

        // // Complete the completer with an error if it's not completed yet
        // if (!completer.isCompleted) {
        //   completer.completeError(err);
        // }
      },
    );

    // Start the connection
    await newEventSourceConnection.connect();

    // Wait for the completer to be completed, i.e., either connected or an error occurred
    await completer.future;
  }

  onMessage(data) {
    // print("message $data");
    if (data['eventListener']["guid"] != null) {
      var event = events[data['eventListener']["guid"]];
      event?.handler(data);
    } else {
      print("no inResponseTo $data");
    }
  }
}

var sseNotifications = MyEventSource();
