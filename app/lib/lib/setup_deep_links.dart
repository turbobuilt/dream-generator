import 'package:app_links/app_links.dart';

import '../main.dart';

setupDeepLinks() {
  final appLinks = AppLinks();
  appLinks.uriLinkStream.listen((uri) {
    print("handling deep link");
    print(uri);
    if (globalAuthenticatedUser.id != null && globalAuthenticatedUser.id! > 0) {
      handleDeepLink(uri);
    } else {
      deepLink = uri;
    }
  });
}
