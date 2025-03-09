import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

class SimpleWebviewController extends WebViewController with ChangeNotifier {
  late String url;
  var loading = true;

  SimpleWebviewController(this.url) {
    if (url == "") {
      return;
    }
    loadInfo();
  }

  loadInfo() async {
    var response = await Dio().get(url);
    loadHtmlString(response.data);
    loading = false;
    notifyListeners();
  }
}

class SimpleWebViewPage extends StatelessWidget {
  final SimpleWebviewController controller = SimpleWebviewController("");

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox(
        height: MediaQuery.of(context).size.height,
        child: Column(
          children: [
            Container(
              // background gradient left to right blue to purple
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.blue, Colors.purple],
                ),
              ),
              child: AppBar(title: const Text('Terms')),
            ),
            ChangeNotifierProvider.value(
              value: controller,
              child: Consumer<SimpleWebviewController>(
                builder: (context, controller, child) {
                  if (controller.loading) {
                    return const Expanded(
                      child: Column(
                        children: [
                          SizedBox(height: 30),
                          CircularProgressIndicator(),
                        ],
                      ),
                    );
                  } else {
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(5),
                        child: WebViewWidget(controller: controller),
                      ),
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SimpleTermsView extends SimpleWebViewPage {
  @override
  final SimpleWebviewController controller = SimpleWebviewController("https://dreamgenerator.ai/terms");
}

class SimplePrivacyView extends SimpleWebViewPage {
  @override
  final SimpleWebviewController controller = SimpleWebviewController("https://dreamgenerator.ai/privacy");
}
