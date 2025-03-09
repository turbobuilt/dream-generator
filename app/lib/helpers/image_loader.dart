import 'package:dev/helpers/network_helper.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';

class ImageLoaderData extends ChangeNotifier {
  BuildContext? context;
  String error = "";

  String? _url;
  String? get url => _url;
  set url(String? value) {
    _url = value;
    if(value == null) {
      return;
    }
    loadImage();
  }

  loadImage() async {
    // download image
    final result = await getRequest(_url!);
    if(result.error?.isEmpty ?? true) {
      print("error: ${result.error}");
      error = result.error ?? "unknown error contact support@dreamgenerator.ai for help.";
      return;
    }
    // save to disk
  }
}

class ImageLoader extends StatelessWidget {
  ImageLoaderData data = ImageLoaderData();

  ImageLoader(String? url) {
    data.url = url;
  }

  @override
  Widget build(BuildContext context) {
    data.context = context;
    return ChangeNotifierProvider.value(
      value: data,
      child: Consumer<ImageLoaderData>(
        builder: (context, data, child) {
          return Container();
        },
      ),
    );
  }
}
