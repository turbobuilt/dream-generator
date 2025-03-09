import 'package:firebase_core/firebase_core.dart';

import '../firebase_options.dart';

initFirebase() async {
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (err) {
    print("Firebase.initializeApp error: $err");
  }
}