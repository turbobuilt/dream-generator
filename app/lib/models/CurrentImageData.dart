import 'dart:typed_data';

import 'package:reflectable/reflectable.dart';
import 'package:flutter_avif/flutter_avif.dart';
import '../helpers/datastore.dart';
import 'Serializable.dart';

@reflector
class CurrentImageData {
  String name = "";
  String prompt = "";
  String style = "";
  int? mostRecentShare;
  var liked = false;
  int? promptId;
  var isOwnPrompt = false;
  String? model;
  // imageBytes
  Uint8List? imageBytes;

  CurrentImageData.empty();
  CurrentImageData(this.name, this.prompt, this.style, {this.model = "", this.promptId, this.liked = false, this.imageBytes});

  save() async {
    final box = await getBox<Map>("images");
    final mirror = reflector.reflect(this);
    final map = <String, dynamic>{};
    mirror.type.declarations.forEach((key, value) {
      if (value is VariableMirror) {
        map[key] = mirror.invokeGetter(key);
      }
    });
    box.put(name, map);
  }

  static Future<CurrentImageData?> load(String imageName) async {
    final box = await getBox<Map>("images");
    final result = await box.get(imageName);
    if (result == null) {
      return null;
    }
    final object = CurrentImageData.empty();
    final mirror = reflector.reflect(object);
    result.forEach((key, value) {
      mirror.invokeSetter(key, value);
    });
    return object;
  }

  delete() async {
    final box = await getBox<Map>("images");
    box.delete(name);
  }
}
