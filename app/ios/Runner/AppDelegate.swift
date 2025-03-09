import UIKit
import flutter_callkit_incoming
import Flutter
import FBSDKCoreKit
import CallKit
import AVFAudio
import PushKit
import WebRTC

#if DEBUG
let apiOrigin = "http://10.0.0.90:5005"
#else
let apiOrigin = "https://api.dreamgenerator.ai"
#endif

@UIApplicationMain
class AppDelegate: FlutterAppDelegate, PKPushRegistryDelegate, CallkitIncomingAppDelegate {
    var webRTCViewVisible = false
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        //        PushKitManager.shared.setupPushKit()
        
                let controller = window?.rootViewController as! FlutterViewController
                MessageHandler.setupChannel(for: controller)
        
        //        MyEventSource.shared.loadToken()
        //        MyEventSource.shared.connect()
        //        // Add observers for entering background and foreground
        //        NotificationCenter.default.addObserver(self, selector: #selector(didEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        //        NotificationCenter.default.addObserver(self, selector: #selector(willEnterForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
        //
        
        let mainQueue = DispatchQueue.main
        let voipRegistry: PKPushRegistry = PKPushRegistry(queue: mainQueue)
        voipRegistry.delegate = self
        voipRegistry.desiredPushTypes = [PKPushType.voIP]
        
        GeneratedPluginRegistrant.register(with: self)
        
        
        let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)
        
        //        // after 5 seconds, show web rtc view
        //        DispatchQueue.main.asyncAfter(deadline: .now() + 0) {
        //            VideoCallState.shared.getLocalStream()
        //            self.showWebRTCView()
        //        }
        return result
    }
    
    @objc func didEnterBackground() {
        print("App entered background")
        MyEventSource.shared.stop()
        // Handle tasks when the app enters the background
    }
    
    @objc func willEnterForeground() {
        print("App will enter foreground")
        //        MyEventSource.shared.connect()
    }
    
    // Call back from Recent history
    override func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        
        guard let handleObj = userActivity.handle else {
            return false
        }
        
        guard let isVideo = userActivity.isVideo else {
            return false
        }
        let objData = handleObj.getDecryptHandle()
        let nameCaller = objData["nameCaller"] as? String ?? ""
        let handle = objData["handle"] as? String ?? ""
        let data = flutter_callkit_incoming.Data(id: UUID().uuidString, nameCaller: nameCaller, handle: handle, type: isVideo ? 1 : 0)
        
        SwiftFlutterCallkitIncomingPlugin.sharedInstance?.startCall(data, fromPushKit: true)
        return super.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // Handle updated push credentials
    func pushRegistry(_ registry: PKPushRegistry, didUpdate credentials: PKPushCredentials, for type: PKPushType) {
        print(credentials.token)
        let deviceToken = credentials.token.map { String(format: "%02x", $0) }.joined()
        print(deviceToken)
        //Save deviceToken to your server
        SwiftFlutterCallkitIncomingPlugin.sharedInstance?.setDevicePushTokenVoIP(deviceToken)
    }
    
    func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
        print("didInvalidatePushTokenFor")
        SwiftFlutterCallkitIncomingPlugin.sharedInstance?.setDevicePushTokenVoIP("")
    }
    
    // Handle incoming pushes
    func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
        print("didReceiveIncomingPushWith")
        guard type == .voIP else { return }
        print("payload is", payload.dictionaryPayload)
        var id = ""
        var nameCaller = ""
        var handle = ""
        let isVideo = true
        
        if let payload = payload.dictionaryPayload as? [AnyHashable: Any] {
            if let data = payload[AnyHashable("data")] as? [String: Any],
               let originator = data["originator"] as? [String: Any],
               let userName = originator["userName"] as? String,
               let callRoom = data["callRoom"] as? [String: Any],
               let callRoomUuid = callRoom["uuid"] as? String {
                print("UserName: \(userName)")
                nameCaller = userName
                handle = userName
                id = callRoomUuid
            } else {
                print("UserName not found")
            }
        } else {
            print("Payload format is incorrect")
        }
        
        let data = flutter_callkit_incoming.Data(id: id, nameCaller: nameCaller, handle: handle, type: isVideo ? 1 : 0)
        //set more data
        data.extra = (payload.dictionaryPayload as NSDictionary)["data"] as! NSDictionary
        data.uuid = UUID().uuidString
        VideoCallState.shared.currentCallData = Optional(data)
        SwiftFlutterCallkitIncomingPlugin.sharedInstance?.showCallkitIncoming(data, fromPushKit: true)
        //Make sure call completion()
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            completion()
        }
    }
    
    // Func Call api for Accept
    func onAccept(_ call: Call, _ action: CXAnswerCallAction) {
        let json = ["action": "ACCEPT", "data": call.data.toJSON()] as [String: Any]
        print("LOG: onAccept")
        print("json is", json)
        let data = json["data"] as! [String: Any]
        action.fulfill()
        return
        //            MyEventSource.shared.connect(){ result in
        //                switch result {
        //                case .success:
        //                    print("Successfully connected!")
        //                    VideoCallState.shared.receiveCall(incomingCall: data["extra"] as! [String: Any])
        //                case .failure(let error):
        //                    print("Failed to connect: \(error.localizedDescription)")
        //                    self.showAlert(title: "Error", message: error.localizedDescription)
        //                    self.closeWebRTCView()
        //                }
        //            }
        //            showWebRTCView()
        //            action.fulfill()
    }
    
    // Func Call API for Decline
    func onDecline(_ call: Call, _ action: CXEndCallAction) {
        let json = ["action": "DECLINE", "data": call.data.toJSON()] as [String: Any]
        print("LOG: onDecline")
        action.fulfill()
    }
    
    // Func Call API for End
    func onEnd(_ call: Call, _ action: CXEndCallAction) {
        let json = ["action": "END", "data": call.data.toJSON()] as [String: Any]
        print("LOG: onEnd")
        action.fulfill()
    }
    
    // Func Call API for TimeOut
    func onTimeOut(_ call: Call) {
        let json = ["action": "TIMEOUT", "data": call.data.toJSON()] as [String: Any]
        print("LOG: onTimeOut")
    }
    
    // Func Callback Toggle Audio Session
    func didActivateAudioSession(_ audioSession: AVAudioSession) {
        //Use if using WebRTC
        //RTCAudioSession.sharedInstance().audioSessionDidActivate(audioSession)
        //RTCAudioSession.sharedInstance().isAudioEnabled = true
    }
    
    // Func Callback Toggle Audio Session
    func didDeactivateAudioSession(_ audioSession: AVAudioSession) {
        //Use if using WebRTC
        //RTCAudioSession.sharedInstance().audioSessionDidDeactivate(audioSession)
        //RTCAudioSession.sharedInstance().isAudioEnabled = false
    }
    
    
    func showWebRTCView() {
        guard let rootViewController = window?.rootViewController else {
            return
        }
        if webRTCViewVisible == true {
            return
        }
        webRTCViewVisible = true
        rootViewController.present(VideoCallViewController.shared, animated: true, completion: nil)
    }
    
    func closeWebRTCView() {
        if webRTCViewVisible == false {
            return
        }
        webRTCViewVisible = false
        VideoCallViewController.shared.dismiss(animated: true, completion: nil)
    }
    
    
    func showAlert(title: String, message: String) {
        DispatchQueue.main.async {
            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let topController = scene.windows.first?.rootViewController else { return }
            
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
            topController.present(alert, animated: true, completion: nil)
        }
    }
}
