class CallRoom {
  int? id;
  String? name;
  String? uuid;
  int? originator;

  CallRoom({
    this.id,
    this.name,
    this.uuid,
    this.originator,
  });

  toMap() {
    return {
      "id": id,
      "name": name,
      "uuid": uuid,
      "originator": originator,
    };
  }

  fromMap(json) {
    id = json["id"];
    name = json["name"];
    uuid = json["uuid"];
    originator = json["originator"];
  }

  static createFromMap(json) {
    var item = CallRoom();
    item.fromMap(json);
    return item;
  }
}

class ActiveVideoChat {
  List<int> recipients;
  CallRoom? callRoom;
  Map<String, dynamic>? originator;
  bool active;

  ActiveVideoChat({
    required this.recipients,
    this.callRoom,
    this.originator,
    this.active = false,
  });

  toMap() {
    return {
      "recipients": recipients,
      "callRoom": callRoom?.toMap(),
      "originator": originator,
      "active": active,
    };
  }

  fromMap(json) {
    recipients = json["recipients"];
    callRoom = CallRoom.createFromMap(json["callRoom"]);
    originator = json["originator"];
    active = json["active"];
  }

  static createFromMap(json) {
    print("creating active video chat $json");
    var item = ActiveVideoChat(
      recipients: List<int>.from(json["recipients"]),
      callRoom: CallRoom.createFromMap(json["callRoom"]),
      originator: Map<String, dynamic>.from(json["originator"]),
      active: json?["active"] ?? false,
    );
    return item;
  }
}