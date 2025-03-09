import 'package:flutter/cupertino.dart';
import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';


BoxCollection? collection;

Future<BoxCollection> getDb() async {
  WidgetsFlutterBinding.ensureInitialized();
  final directory = await getApplicationDocumentsDirectory();
  print("${directory.path}/db");
  // Hive.init(directory.path);
  collection ??= await BoxCollection.open(
    'DreamGenerator', // Name of your database
    {'images','promptCategoryVideos','network_asset','settings','generateAudioRequest'}, // Names of your boxes
    path: "${directory.path}/db",
  );
  return collection!;
}

Future<CollectionBox<T>> getBox<T>(String name) async {
  final db = await getDb();
  final box = await db.openBox<T>(name);
  return box;
}
