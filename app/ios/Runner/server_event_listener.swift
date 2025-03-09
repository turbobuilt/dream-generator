import Foundation

class EventSourceConnection: NSObject, URLSessionDataDelegate {
    var url: String
    var token: String
    var events: [String: EventRegistration]
    var onMessage: (([String: Any]) -> Void)?
    var onConnected: (() -> Void)?
    var onError: ((Error) -> Void)?
    var session: URLSession?
    var task: URLSessionDataTask?
    var buffer: String = ""
    
    init(url: String, token: String, events: [String: EventRegistration], onMessage: @escaping ([String: Any]) -> Void, onConnected: @escaping () -> Void, onError: @escaping (Error) -> Void) {
        self.url = url
        self.token = token
        self.events = events
        self.onMessage = onMessage
        self.onConnected = onConnected
        self.onError = onError
        super.init()
    }
    
    func connect() {
        guard let url = URL(string: self.url) else { return }
        print("Will connect swift to")
        
        var request: URLRequest = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpShouldUsePipelining = true
        request.setValue("text/event-stream", forHTTPHeaderField: "Accept")
        request.setValue(token, forHTTPHeaderField: "authorizationtoken")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // never timeout
        request.timeoutInterval = 0


        var eventsJson: [String: Any] = [:]
        for event in events.values {
            eventsJson[event.guid] = event.toMap()
        }
        let data = ["events": ["token": ["clientId": "sseClientId", "token": token, "eventListeners": eventsJson]]]
        let jsonData = try! JSONSerialization.data(withJSONObject: data, options: [])
        request.httpBody = jsonData

        
        let config = URLSessionConfiguration.default
        session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
        task = session?.dataTask(with: request)
        task?.resume()
        print("started connection to sse swift\n")
    }
    
    func kill() {
        DispatchQueue.main.async {
            self.task?.cancel()
            self.session?.invalidateAndCancel()
        }
    }
    
    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
        if let text = String(data: data, encoding: .utf8) {
            buffer += text
            processBuffer()
        }
    }
    // handle error
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error {
            onError?(error)
        }
    }

    func processBuffer() {
        while let range = buffer.range(of: "\n\n") {
            let message = String(buffer[..<range.lowerBound])
            buffer = String(buffer[range.upperBound...])
            handleMessage(message)
        }
    }
    
    func handleMessage(_ message: String) {
        let event = parseSSEMessage(message)
        print("got sse event", event["event"])
        if event["event"] as? String == "connected" {
            print("Connected swift")
            onConnected?()
        } else if event["data"] != nil {
            let jsonData = (event["data"] as! String).data(using: .utf8)!
            do {
                if let json = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
                    onMessage?(json)
                }
            } catch {
                onError?(error)
            }
        }
    }
    
    func parseSSEMessage(_ message: String) -> [String: Any] {
        var event: String?;
        var data = "";
        
        let lines = message.split(separator: "\n")
        for line in lines {
            if line.starts(with: "event:") {
                event = String(line.dropFirst(6)).trimmingCharacters(in: .whitespaces)
            } else if line.starts(with: "data:") {
                data += String(line.dropFirst(5)).trimmingCharacters(in: .whitespaces) + "\n"
            }
        }
        
        return ["event": event ?? "", "data": data.trimmingCharacters(in: .whitespaces)]
    }
}

class EventRegistration {
    var guid: String
    var token: String?
    var type: String
    var data: [String: Any]?
    var handler: ([String: Any]) -> Void
    
    init(guid: String, type: String, handler: @escaping ([String: Any]) -> Void, data: [String: Any]? = nil) {
        self.guid = guid
        self.type = type
        self.handler = handler
        self.data = data
    }
    
    func toMap() -> [String: Any] {
        return [
            "guid": guid,
            "token": token ?? "",
            "type": type,
            "data": data ?? [:]
        ]
    }
}

class MyEventSource {
    static var shared = MyEventSource(url: apiOrigin + "/api/post-subscribe-to-notifications")
    var id: String
    var url: String
    var token: String?
    var events: [String: EventRegistration] = [:]
    var eventSource: EventSourceConnection?
    var lastConnection: Int = 0
    var lastTokenRefresh: Int = Int(Date().timeIntervalSince1970 * 1000)
    
    init(url: String) {
        self.id = UUID().uuidString
        self.url = url
        setupEvents()
    }
    
    func loadToken() {
        token = UserDefaults.standard.string(forKey: "userToken")
    }
    
    func setupEvents() {
        // Explicitly create EventRegistration for each event name
        let events: [EventRegistration] = [
            EventRegistration(guid: UUID().uuidString, type: "videoChatCallRequest", handler: { data in
                print("Received server data Event videoChatCallRequest")
//                MessageHandler.sharedChannel?.invokeMethod("videoChatCallRequest", arguments: data)
                VideoCallState.shared.videoChatCallRequest(eventResponse: data)
            }),
            EventRegistration(guid: UUID().uuidString, type: "endVideoChat", handler: { data in
                print("Received server data Event endVideoChat")
//                MessageHandler.sharedChannel?.invokeMethod("endVideoChat", arguments: data)
                VideoCallState.shared.endVideoChatReceived(data: data as! [String: [String: Any]])
            }),
            EventRegistration(guid: UUID().uuidString, type: "videoChatSdpOffer", handler: { data in
                print("Received server data Event videoChatSdpOffer")
//                MessageHandler.sharedChannel?.invokeMethod("videoChatSdpOffer", arguments: data)
                VideoCallState.shared.videoChatSdpOffer(eventResponse: data)
            }),
            EventRegistration(guid: UUID().uuidString, type: "videoChatCallAnswer", handler: { data in
                print("Received server data Event videoChatCallAnswer")
//                MessageHandler.sharedChannel?.invokeMethod("videoChatCallAnswer", arguments: data)
                VideoCallState.shared.videoChatCallAnswer(eventResponse: data)
            }),
            EventRegistration(guid: UUID().uuidString, type: "videoChatSdpAnswer", handler: { data in
                print("Received server data Event videoChatSdpAnswer")
//                MessageHandler.sharedChannel?.invokeMethod("videoChatSdpAnswer", arguments: data)
                VideoCallState.shared.videoChatSdpAnswer(eventResponse: data)
            }),
            EventRegistration(guid: UUID().uuidString, type: "iceCandidate", handler: { data in
                print("Received server data Event iceCandidate")
//                MessageHandler.sharedChannel?.invokeMethod("iceCandidate", arguments: data)
                VideoCallState.shared.iceCandidate(eventResponse: data)
            }),
            EventRegistration(guid: UUID().uuidString, type: "videoChatReject", handler: { data in
                print("Received server data Event videoChatReject")
//                MessageHandler.sharedChannel?.invokeMethod("videoChatReject", arguments: data)
                VideoCallState.shared.videoChatReject(call: data)
            })
        ]
        
        // Create event for each flutter event
        let flutterEvents = ["chatMessage","notification"]
        let flutterEventRegistrations: [EventRegistration] = flutterEvents.map { name in
            EventRegistration(guid: UUID().uuidString, type: name, handler: { data in
                print("Received Flutter Event \(name)")
                MessageHandler.sharedChannel?.invokeMethod(name, arguments: data)
            })
        }
        
        // Store all events in the dictionary
        for event in events + flutterEventRegistrations {
            self.events[event.guid] = event
        }
    }
    
    func connect(completion: ((Result<Void, Error>) -> Void)? = nil) {
        guard let token = token else {
            print("No token, stopping")
            stop()
            completion?(.failure(NSError(domain: "ConnectionError", code: 0, userInfo: [NSLocalizedDescriptionKey: "No token"])))
            return
        }
        if eventSource != nil {
            print("sse connection already live")
            completion?(.success(())) // Signal successful connection
            return
        }
        
        print("Connecting \(Date()) id \(id)")
        
        eventSource = EventSourceConnection(url: url, token: token, events: events, onMessage: { data in
            self.onMessage(data)
        }, onConnected: {
            print("Connected to event source")
            completion?(.success(())) // Signal successful connection
        }, onError: { error in
            print("Error connecting to event source: \(error)")
            self.scheduleReconnect()
            completion?(.failure(error)) // Signal error
        })
        
        eventSource?.connect()
    }

    
    func stop() {
        print("Stopping SSE")
        eventSource?.kill()
        eventSource = nil
        print("Stopped SSE")
    }
    
    func scheduleReconnect() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            self.connect()
        }
    }
    
    func onMessage(_ data: [String: Any]) {
        print("SWIFT GOT DATA")
        print(data["event"])
        if let guid = data["eventListener"] as? [String: Any], let eventGuid = guid["guid"] as? String, let event = events[eventGuid] {
            event.handler(data)
        } else {
            print("No eventListener")
        }
    }
}
