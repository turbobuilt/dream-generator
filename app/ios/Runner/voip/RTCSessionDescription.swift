import WebRTC

extension RTCSessionDescription {
    func toMap() -> [String: Any] {
        return [
            "sdp": self.sdp,
            "type": self.type.toString()
        ]
    }
}


extension RTCSdpType {
    public func toString() -> String {
        var typeString = ""
        switch self {
        case .offer:
            typeString = "offer"
        case .prAnswer:
            typeString = "pranswer"
        case .answer:
            typeString = "answer"
        case .rollback:
            typeString = "rollback"
        }
        return typeString
    }
    
    public static func toType(typeString: String) -> RTCSdpType? {
        switch typeString.lowercased() {
        case "offer":
            return .offer
        case "pranswer":
            return .prAnswer
        case "answer":
            return .answer
        case "rollback":
            return .rollback
        default:
            return nil
        }
    }
}
