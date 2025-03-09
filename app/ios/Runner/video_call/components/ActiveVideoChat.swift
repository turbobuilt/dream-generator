

class ActiveVideoChat {
    var recipients: [Int]
    var callRoom: CallRoom?
    var originator: [String: Any]?
    var active: Bool

    init(recipients: [Int], callRoom: CallRoom? = nil, originator: [String: Any]? = nil, active: Bool = false) {
        self.recipients = recipients
        self.callRoom = callRoom
        self.originator = originator
        self.active = active
    }

    func toMap() -> [String: Any?] {
        return ["recipients": recipients, "callRoom": callRoom?.toMap(), "originator": originator, "active": active]
    }

    func fromMap(json: [String: Any]) {
        recipients = json["recipients"] as? [Int] ?? []
        callRoom = CallRoom.createFromMap(json: json["callRoom"] as? [String: Any] ?? [:])
        originator = json["originator"] as? [String: Any]
        active = json["active"] as? Bool ?? false
    }

    static func createFromMap(json: [String: Any]) -> ActiveVideoChat {
        return ActiveVideoChat(
            recipients: json["recipients"] as? [Int] ?? [],
            callRoom: CallRoom.createFromMap(json: json["callRoom"] as? [String: Any] ?? [:]),
            originator: json["originator"] as? [String: Any],
            active: json["active"] as? Bool ?? false
        )
    }
}
