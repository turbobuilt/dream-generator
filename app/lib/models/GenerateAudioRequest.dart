// export class GenerateAudioRequest extends DbObject {
//     prompt: string;
//     model: string;
//     status?: string;
//     duration?: number;
//     error?: string;
//     outputUrl?: string;
// }

import 'dart:io';

import 'package:dev/helpers/datastore.dart';
import 'package:path_provider/path_provider.dart';

class GenerateAudioRequest {
  late int id;
  late int created;
  late int updated;
  late String prompt;
  late String model;
  late String status;
  late int duration;
  late String error;
  late String outputUrl;
  late int sharedAudioId;
  late int shareId;
  bool published = false;
  var downloaded = false;

  static getAudioDir() async {
    var documents = await getApplicationDocumentsDirectory();
    var dir = Directory("${documents.path}/audio");
    // make sure dir exists
    if (!await dir.exists()) {
      await dir.create();
    }
    return dir.path;
  }

  getLocalPath() async {
    var dir = await getAudioDir();
    var path = "$dir/$id.wav";
    return path;
  }

  Future<int> getFileSize() async {
    var path = await getLocalPath();
    var file = File(path);
    if (await file.exists()) {
      return await file.length(); // Returns the file size in bytes
    } else {
      throw Exception("File does not exist");
    }
  }

  checkIfDownloaded() async {
    var path = await getLocalPath();
    downloaded = await File(path).exists();
    return downloaded;
  }

  save() async {
    var box = await getBox<Map>("generateAudioRequest");
    await box.put(id.toString(), toJson());
  }

  delete() async {
    var box = await getBox<Map>("generateAudioRequest");
    await box.delete(id.toString());
    var path = await getLocalPath();
    await File(path).delete();
    downloaded = false;
  }

  GenerateAudioRequest(
      {this.id = 0,
      this.created = 0,
      this.updated = 0,
      this.prompt = "",
      this.model = "",
      this.status = "",
      this.duration = 0,
      this.error = "",
      this.outputUrl = "",
      this.published = false,
      this.sharedAudioId = 0,
      this.shareId = 0,
      });

  GenerateAudioRequest.fromJson(Map<dynamic, dynamic> json) {
    id = json['id'];
    created = json['created'];
    updated = json['updated'];
    prompt = json['prompt'];
    model = json['model'];
    status = json['status'];
    duration = json['duration'];
    error = json['error'] ?? "";
    outputUrl = json['outputUrl'];
    published = json['published'] ?? false;
    sharedAudioId = json['sharedAudioId'] ?? 0;
    shareId = json['shareId'] ?? 0;
  }

  Map<dynamic, dynamic> toJson() {
    final Map<dynamic, dynamic> data = <dynamic, dynamic>{};
    data['id'] = id;
    data['created'] = created;
    data['updated'] = updated;
    data['prompt'] = prompt;
    data['model'] = model;
    data['status'] = status;
    data['duration'] = duration;
    data['error'] = error;
    data['outputUrl'] = outputUrl;
    data['published'] = published;
    data['sharedAudioId'] = sharedAudioId;
    data['shareId'] = shareId;
    return data;
  }
}
