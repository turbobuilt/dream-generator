class MessageHandler {
    static var sharedChannel: FlutterMethodChannel?

    static func setupChannel(for controller: FlutterViewController) {
        sharedChannel = FlutterMethodChannel(name: "com.dreamgenerator.ai/messages", binaryMessenger: controller.binaryMessenger)
        sharedChannel!.setMethodCallHandler { (call, result) in
            if call.method == "setUserToken" {
                if let userToken = call.arguments as? String {
                    print("Received message: \(userToken)")
                    UserDefaults.standard.set(userToken, forKey: "userToken")
                    if userToken == "" {
                        // MyEventSource.shared.token = ""
                        // MyEventSource.shared.stop()
                    } else if MyEventSource.shared.token != userToken {
                        // MyEventSource.shared.token = userToken
                        // MyEventSource.shared.connect()
                    }
                }
                result(nil)
            } else {
                result(FlutterMethodNotImplemented)
            }
        }
    }
    
    // add way to send event with body
    static func sendEvent(_ event: String, body: String) {
        sharedChannel?.invokeMethod(event, arguments: body)
    }

}
