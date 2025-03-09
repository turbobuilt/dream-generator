//
//  CallMethod.swift
//  Runner
//
//  Created by Dev on 9/5/24.
//

import Foundation



import Foundation

struct GlobalStore {
    static var userToken: String = ""
}
struct CallMethodResult {
    var data: Any?
    var error: Error?
}

func callMethod(name: String, args: [Any], completion: @escaping (CallMethodResult) -> Void) {
    do {
        let method = name.range(of: "^(get|post|put|delete)[A-Z]", options: .regularExpression) != nil ? "get" : "post"
        var queryString = "?methodName=\(name)"
        
        if method == "get" {
            for (index, arg) in args.enumerated() {
                if let arg = arg as? [String: Any], let key = arg["key"] as? String, let value = arg["value"] {
                    queryString += "\(index == 0 ? "&" : "&")\(key)=\(value)"
                }
            }
        }
        
        guard let url = URL(string: "\(apiOrigin)/api/method-call\(queryString)") else {
            completion(CallMethodResult(data: nil, error: NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(UserDefaults.standard.string(forKey: "userToken") ?? "", forHTTPHeaderField: "authorizationtoken")
        
        let body: [String: Any] = ["methodName": name, "args": args]
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(CallMethodResult(data: nil, error: error))
                return
            }
            
            guard let data = data, let httpResponse = response as? HTTPURLResponse else {
                completion(CallMethodResult(data: nil, error: NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data or response"])))
                return
            }
            
            if httpResponse.statusCode == 200 {
                do {
                    let json = try JSONSerialization.jsonObject(with: data, options: [])
                    completion(CallMethodResult(data: json, error: nil))
                } catch {
                    completion(CallMethodResult(data: nil, error: error))
                }
            } else {
                let errorString = String(data: data, encoding: .utf8) ?? "Unknown error"
                completion(CallMethodResult(data: nil, error: NSError(domain: "", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "Failed to call method: \(httpResponse.statusCode) \(errorString)"])))
            }
        }
        
        task.resume()
    } catch {
        completion(CallMethodResult(data: nil, error: error))
    }
}
