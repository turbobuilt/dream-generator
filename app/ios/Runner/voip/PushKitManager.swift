import PushKit

class PushKitManager: NSObject, PKPushRegistryDelegate {
    static let shared = PushKitManager()
    
    func setupPushKit() {
        let pushRegistry = PKPushRegistry(queue: DispatchQueue.main)
        pushRegistry.delegate = self
        pushRegistry.desiredPushTypes = [.voIP]
    }
    
    func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
        print("push credentials")
        print(pushCredentials.token)
    }
    
    func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
        // Handle incoming push notification
        if type == PKPushType.voIP {
            let payloadDictionary = payload.dictionaryPayload as NSDictionary
            CallManager.shared.reportIncomingCall(uuid: UUID(), handle: "Caller Name", payload: payloadDictionary, completion: completion)
        }
    }
}
