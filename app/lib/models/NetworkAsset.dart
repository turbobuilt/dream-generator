import 'dart:io';
import 'dart:typed_data';

import 'package:path_provider/path_provider.dart';
import 'package:reflectable/mirrors.dart';
import 'package:time_machine/time_machine.dart';

import '../helpers/datastore.dart';
import '../helpers/network_helper.dart';
import 'Serializable.dart';

@reflector
class NetworkAsset extends Serializable {
  int id = 0;
  String url = "";
  BigInt created = BigInt.zero;
  // raw data
  Uint8List? data;

  String error = "";

  static startup() {}

  NetworkAsset(this.url);

  save() async {
    final box = await getBox<Map>("network_asset");
    final map = <String, dynamic>{};
    map["url"] = url;
    map["created"] = created;
    box.put(url, map);
  }

  static Future purgeOldDownloads() async {
    // purge files older than 1 week, or if there are more than 20 files
    final box = await getBox<Map>("network_asset");
    final keys = await box.getAllKeys();
    final now = Instant.now();
    var count = 0;
    for (var key in keys) {
      final result = await box.get(key);
      if (result == null) {
        await box.delete(key);
        continue;
      }
      final created = Instant.fromEpochBigIntNanoseconds(result["created"]);
      final age = created.timeUntil(now);
      final days = age.inDays;
      
      if (days > 7 || count > 20) {
        await box.delete(key);
      }
      count++;
    }

  }

  getFilePath() async {
    // write to support directory
    final dir = await getApplicationSupportDirectory();
    final path = "${dir.path}/network_asset/$id";
    return path;
  }

  static Future<NetworkAsset?> load(String url) async {
    final box = await getBox<Map>("network_asset");
    await box.delete(url);
    final result = await box.get(url);
    final object = NetworkAsset(url);
    if (result != null) {
      object.created = result["created"];
      object.url = result["url"];
      return object;
    }
    final networkResult = await getRequest(url);
    if (networkResult.error?.isNotEmpty == true) {
      print("error loading image: ${networkResult.error}");
      object.error = networkResult.error ?? "unknown error contact support@dreamgenerator.ai for help.";
      return object;
    }
    // get id by finding the max value of all items in storage
    final keys = await box.getAllKeys();
    final values = await box.getAllValues();
    var maxId = 0;
    for (var key in keys) {
      final value = values[key];
      if (value?["id"] ?? 0 > maxId) {
        maxId = value?["id"];
      }
    }
    object.id = maxId + 1;
    // save to disk
    final path = await object.getFilePath();
    final file = File(path);
    // make dir
    await file.parent.create(recursive: true);
    await file.writeAsBytes(networkResult.result);
    object.data = networkResult.result;
    object.created = Instant.now().epochNanosecondsAsBigInt;
    object.save();

    return object;
  }
}
