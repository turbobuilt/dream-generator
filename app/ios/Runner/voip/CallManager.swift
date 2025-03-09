import CallKit
import PushKit

class CallManager: NSObject, CXProviderDelegate {
    func providerDidReset(_ provider: CXProvider) {
        print("provider reseted")
    }
    
    static let shared = CallManager()
    
    private let provider: CXProvider
    private let callController: CXCallController
    var callUpdate: CXCallUpdate = CXCallUpdate()
    
    private override init() {
        provider = CXProvider(configuration: CallManager.providerConfiguration)
        callController = CXCallController()
        super.init()
        provider.setDelegate(self, queue: nil)
    }
    
    static var providerConfiguration: CXProviderConfiguration {
        let config = CXProviderConfiguration(localizedName: "YourApp")
        config.supportsVideo = true
        config.maximumCallsPerCallGroup = 1
        config.supportedHandleTypes = [.generic]
        return config
    }
    
    func reportIncomingCall(uuid: UUID, handle: String, payload: NSDictionary, completion: @escaping () -> Void) {
        callUpdate = CXCallUpdate()
        callUpdate.remoteHandle = CXHandle(type: .generic, value: handle)
        callUpdate.hasVideo = true
        
        provider.reportNewIncomingCall(with: uuid, update: callUpdate) { error in
            if let error = error {
                print("Error reporting incoming call: \(error.localizedDescription)")
            } else {
                // Start WebRTC connection here
//                WebRTCManager.shared.connect(payload: payload)
                VideoCallState.shared.receiveCall(incomingCall: payload as! [String: Any])
            }
        }
        completion()
    }
    
    func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        // Answer the call and start WebRTC connection
        
        action.fulfill()
    }
    
    func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        // End the call and clean up WebRTC connection
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.closeWebRTCView()
        }
        action.fulfill()
    }
}
