//
//  CallRoom.swift
//  Runner
//
//  Created by Dev on 9/15/24.
//

import Foundation

class CallRoom {
    var id: Int?
    var name: String?
    var uuid: String?
    var originator: Int?

    init(id: Int? = nil, name: String? = nil, uuid: String? = nil, originator: Int? = nil) {
        self.id = id
        self.name = name
        self.uuid = uuid
        self.originator = originator
    }

    func toMap() -> [String: Any?] {
        return ["id": id, "name": name, "uuid": uuid, "originator": originator]
    }

    func fromMap(json: [String: Any]) {
        id = json["id"] as? Int
        name = json["name"] as? String
        uuid = json["uuid"] as? String
        originator = json["originator"] as? Int
    }

    static func createFromMap(json: [String: Any]) -> CallRoom {
        let item = CallRoom()
        item.fromMap(json: json)
        return item
    }
}
