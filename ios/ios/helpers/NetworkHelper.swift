import Foundation
import UIKit

// oncomplete takes map string,any, and error message
func GetRequest(url: String, onComplete: @escaping ([String: Any]?, String?) -> Void) {
    let url = URL(string: api_origin + url)!
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    
    request.setValue(globalStore.userToken, forHTTPHeaderField: "AuthorizationToken")
    
    let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
        if let error = error {
            onComplete(nil, "Unexpected error " + error.localizedDescription + " - please contact support@dreamgenerator.ai for help. I apologize for the issue. ")
            return
        }
        
        var errorMsg = ""
        
        do {
            print("Checking data", data)
            guard let data = data else {
                onComplete(nil, "Error parsing data. Please contact support@dreamgenerator.ai for help.  Sorry about the issue, working to fix it.")
                return
            }
            
            do {
                let jsonObject = try JSONSerialization.jsonObject(with: data, options: [])
                print("got data", jsonObject)
                guard let json = jsonObject as? [String: Any] else {
                    // guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                            
                    //     return
                    // }
                    onComplete(nil, "Error parsing data. Please contact support@dreamgenerator.ai for help.  Sorry about the issue, working to fix it.")
                    return
                }
                onComplete(json, nil)
            } catch {
                do {
                    let responseText = String(data: data, encoding: .utf8)
                    print(responseText)
                    onComplete(nil, "Error reading response " + responseText!)
                    return
                } catch {
                    onComplete(nil, "Error reading response " + error.localizedDescription)
                    return
                }
            }
        } catch {
            onComplete(nil, "Error " + error.localizedDescription)
        }
    }
    
    task.resume()
}

func showAlert(withMessage message: String) {
    let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
    UIApplication.shared.keyWindow?.rootViewController?.present(alert, animated: true, completion: nil)
}
