import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:dev/main.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:async';

import 'package:http_parser/http_parser.dart';

class ActionResult<T> {
  final String? error;
  final dynamic result;

  ActionResult(this.result, this.error);
}

class NetworkOptions {}

Future<ActionResult> getRequest(
  String url,
) async {
  String fullUrl = url.startsWith("http") ? url : apiOrigin + url;
  print("GET: $fullUrl");
  var headers = {'Content-Type': 'application/json; charset=UTF-8', "isandroid": Platform.isAndroid.toString(), "isios": Platform.isIOS.toString()};
  print("globalStore.userToken: ${globalStore.userToken}, url $url");
  if (globalStore.userToken != "") {
    headers['authorizationtoken'] = globalStore.userToken;
  }
  http.Response response;
  try {
    response = await http.get(Uri.parse(fullUrl), headers: headers);
  } catch (e) {
    print(e);
    return ActionResult(
        {}, 'Error connecting to server. You may be offline or our server may be down. Contact support@dreamgenerator.ai for help.  Sorry!$e');
  }

  return parseResponseBody(response);
}

Future<ActionResult> deleteRequest(String url) async {
  String fullUrl = url.startsWith("http") ? url : apiOrigin + url;
  print("DELETE: $fullUrl");
  var headers = {'Content-Type': 'application/json; charset=UTF-8', "isandroid": Platform.isAndroid.toString(), "isios": Platform.isIOS.toString()};
  if (globalStore.userToken != "") {
    headers['authorizationtoken'] = globalStore.userToken;
  }
  http.Response response;
  try {
    response = await http.delete(Uri.parse(fullUrl), headers: headers);
  } catch (e) {
    print(e);
    return ActionResult(
        {}, 'Error connecting to server. You may be offline or our server may be down. Contact support@dreamgenerator.ai for help.  Sorry!$e');
  }

  return parseResponseBody(response);
}

Future<ActionResult> headRequest(String url) async {
  String fullUrl = url.startsWith("http") ? url : apiOrigin + url;
  print("HEAD: $fullUrl");
  Map<String, String> headers = {"isandroid": Platform.isAndroid.toString(), "isios": Platform.isIOS.toString()};
  if (globalStore.userToken != "") {
    headers['authorizationtoken'] = globalStore.userToken;
  }
  http.Response response;
  try {
    response = await http.head(Uri.parse(fullUrl), headers: headers);
  } catch (e) {
    print(e);
    return ActionResult(
        {}, 'Error connecting to server. You may be offline or our server may be down. Contact support@dreamgenerator.ai for help.  Sorry!$e');
  }

  Map<String, String> resultHeads = {};
  for (var key in response.headers.keys) {
    resultHeads[key] = response.headers[key]!;
  }
  return ActionResult(resultHeads, null);
}

Future<ActionResult> postRequest(String url, body,
    {authenticate = true, Uint8List? imageData, Function(double)? onUploadProgress, Function(String)? sseCallback}) async {
  String fullUrl = url.startsWith("http") ? url : apiOrigin + url;
  http.Response response;

  var headers = {"isandroid": Platform.isAndroid.toString(), "isios": Platform.isIOS.toString()};
  if (globalStore.userToken != "" && authenticate) {
    headers['authorizationtoken'] = globalStore.userToken;
  }

  Future<http.Response> Function() doRequest;
  if (imageData == null) {
    headers['Content-Type'] = 'application/json; charset=UTF-8';
    body = jsonEncode(body);

    if (sseCallback != null) {
      print("doing sse callback");
      var request = http.Request("POST", Uri.parse(fullUrl));
      request.headers.addAll(headers);
      request.body = body;
      var streamedResponse = await request.send();
      print("got response");
      if (streamedResponse.statusCode != 200) {
        var body = await streamedResponse.stream.bytesToString();
        return ActionResult({}, body);
      }
      var completer = Completer();
      String? error;
      streamedResponse.stream.transform(const Utf8Decoder()).listen((line) {
        sseCallback(line);
      }, onDone: () => completer.complete(), onError: (e) {
        print("error in sse");
        print(e);
        error = e.toString();
        completer.complete();
      });
      await completer.future;
      return ActionResult({}, error);
    }
    doRequest = () => http.post(Uri.parse(fullUrl), headers: headers, body: body);
  } else {
    var request = http.MultipartRequest('POST', Uri.parse(fullUrl));
    request.headers.addAll(headers);
    for (var key in (body as Map<dynamic, dynamic>).keys) {
      request.fields.addAll({key.toString(): body[key].toString()});
    }

    // Get the file length
    var length = imageData.length;

    // Create a stream to track the upload progress
    Stream<List<int>> stream = Stream.fromIterable(imageData.buffer.asUint8List().map((e) => [e]));

    // Track the total number of bytes transferred
    int totalBytesTransferred = 0;

    // Transform the stream to listen to the upload progress
    Stream<List<int>> progressStream = stream.transform(
      StreamTransformer.fromHandlers(
        handleData: (data, sink) {
          // Data being sent
          sink.add(data);
          // Keep track of the progress
          totalBytesTransferred += data.length;
          // Call the callback with the current progress
          if (onUploadProgress != null) {
            onUploadProgress(totalBytesTransferred / length * 100);
          }
          // print("progress: ${totalBytesTransferred / length}");
        },
        handleError: (error, stackTrace, sink) {
          sink.addError(error, stackTrace);
        },
        handleDone: (sink) {
          sink.close();
        },
      ),
    );

    // Add the file with the progress stream
    request.files.add(http.MultipartFile(
      'file',
      progressStream.cast(),
      length,
      filename: 'file.jpg', // Change the filename accordingly
      contentType: MediaType('image', 'avif'),
    ));

    doRequest = () => request.send().then((response) => http.Response.fromStream(response));
  }

  body ??= {};
  print(fullUrl);
  try {
    response = await doRequest();
  } catch (e) {
    print(e);
    return ActionResult(
        {}, 'Error connecting to server. You may be offline or our server may be down. Contact support@dreamgenerator.ai for help.  Sorry! $e');
  }

  return parseResponseBody(response);
}

Future<ActionResult> putRequest(url, body, {authenticate = true}) async {
  String fullUrl = url.startsWith("http") ? url : apiOrigin + url;
  http.Response response;
  var headers = {'Content-Type': 'application/json; charset=UTF-8', "isandroid": Platform.isAndroid.toString(), "isios": Platform.isIOS.toString()};
  if (globalStore.userToken != "" && authenticate) {
    headers['authorizationtoken'] = globalStore.userToken;
  }
  body ??= {};
  print(fullUrl);
  try {
    response = await http.put(Uri.parse(fullUrl), headers: headers, body: jsonEncode(body));
  } catch (e) {
    print(e);
    return ActionResult(
        {}, 'Error connecting to server. You may be offline or our server may be down. Contact support@dreamgenerator.ai for help.  Sorry! $e');
  }

  return parseResponseBody(response);
}

ActionResult parseResponseBody(http.Response response) {
  if (response.statusCode == 200) {
    if (response.body == "") {
      return ActionResult("", null);
    } else if (response.body == "null") {
      return ActionResult(null, null);
    }
    // if content type starts with image, return bytes
    if (response.headers['content-type']?.startsWith("image") == true) {
      return ActionResult(response.bodyBytes, null);
    }
    try {
      final Map<String, dynamic> map = json.decode(response.body);
      // if it contains "error" and it's not empty
      if (map.containsKey('error') && map['error'] != null) {
        return ActionResult(map, map['error']);
      }
      return ActionResult(map, null);
    } catch (e) {
      return ActionResult({}, 'Error reading response response was completely empty.');
    }
  } else {
    print("error doing request: ${response.statusCode}");
    try {
      final Map<String, dynamic> map = json.decode(response.body);
      print(map);
      return ActionResult(map, map['error']);
    } catch (e) {
      print("failed to extract json error");
      try {
        // try to get uf8
        final responseText = utf8.decode(response.bodyBytes);
        return ActionResult({}, 'Error reading response $responseText');
      } catch (e) {
        return ActionResult({}, 'Unknown error');
      }
    }
  }
}

void showAlert(String s, {
  required BuildContext context,
  required String message,
}) {
  showDialog<bool>(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        content: Text(message),
        actions: <Widget>[
          TextButton(
            child: const Text('OK'),
            onPressed: () {
              Navigator.of(context).pop(true);
            },
          ),
        ],
      );
    },
  );
}
