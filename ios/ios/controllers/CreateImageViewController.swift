import UIKit
import Alamofire
import StoreKit


func checkIfHasEnoughCredits() -> Bool {
    return false
}

struct GenerateImageResponse: Decodable {
    var taskId: String?;
    var error: String?;
    let creditsRemaining: Int?;
    let code: String?;
}
struct ImageStatusResponse: Decodable {
    let outputUrl: String?;
    let creditsRemaining: Int?;
    let code: String?;
    let error: String?;
    let status: String?;
}

func pollStatus(taskId: String, onStatusUpdate: @escaping (String) -> Void, onComplete: @escaping (String?, String?) -> Void, timer: Timer) {
    let headers: HTTPHeaders = [
        "AuthorizationToken": globalStore.userToken
    ]
    // onStatusUpdate("Polling Status For Image " + taskId)
    AF.request(api_origin + "/api/poll-image-status?taskId=" + taskId, method: .get, headers: headers)
    .responseDecodable(of: ImageStatusResponse.self) { response in
        print(response)
        if let error = response.error {
            onComplete(nil, error.localizedDescription)
        } else if let imageStatusResponse = response.value {
            if imageStatusResponse.error != nil && imageStatusResponse.error != "" {
                timer.invalidate()
                onComplete(nil, imageStatusResponse.error)
                return
            }
            if let status = imageStatusResponse.status {
                onStatusUpdate(status)
            } else {
                timer.invalidate()
                globalAuthenticatedUser.creditsRemaining = imageStatusResponse.creditsRemaining ?? 0
                globalStore.saveUserData()
                onComplete(imageStatusResponse.outputUrl, nil)
            }
        } else {
            onComplete(nil, "Unknown error")
        }
    }
}

func createImageButtonPressed(prompt: String, style: String, onStatusUpdate: @escaping (String) -> Void, onComplete: @escaping (String?, String?) -> Void) {
    print("button pressed", prompt)
    // onComplete("https://www.loremflickr.com/1024/1024", nil)

    let parameters = [
        "prompt": prompt,
        "style": style
    ]

    let headers: HTTPHeaders = [
        "AuthorizationToken": globalStore.userToken
    ]
    
    onStatusUpdate("Submitting Request For Image")
    AF.request(api_origin + "/api/submit-image-generate-with-prompt", method: .post, parameters: parameters, encoder: .json, headers: headers)
    // print curl
    .cURLDescription { description in
        print(description)
    }
    
    
    .responseDecodable(of: GenerateImageResponse.self) { response in
        print(response)

        if let error = response.error {
            onComplete(nil, error.localizedDescription)
        } else if let generateImageResponse = response.value {
            // if it's status code 401 log them out
//            if response.response?.statusCode == 401 {
//                DispatchQueue.main.async {
//                    globalLoginPageStore.error = generateImageResponse.error ??  "You are not logged in"
//                }
//                globalStore.logout()
//                onComplete(nil, nil)
//                return
//            }
            if generateImageResponse.code != nil && generateImageResponse.code != "" {
                if generateImageResponse.code == "insufficient_credits" {
                    globalAuthenticatedUser.creditsRemaining = generateImageResponse.creditsRemaining ?? 0
                    globalStore.saveUserData()
                }
                onComplete(nil, generateImageResponse.code)
                return
            } else if generateImageResponse.error != nil && generateImageResponse.error != "" {
                onComplete(nil, generateImageResponse.error)
                return
            } else if generateImageResponse.taskId != nil && generateImageResponse.taskId != "" {
                // begin polling server every 2 seconds for status
                var timer: Timer?
                var numChecks = 0
                timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { timer in
                    numChecks += 1
                    if numChecks > 60*2 {
                        timer.invalidate()
                        onComplete(nil, "Too long to generate image. Sorry, if this is a bug, please contact support")
                        return
                    }
                    pollStatus(taskId: generateImageResponse.taskId!, onStatusUpdate: onStatusUpdate, onComplete: onComplete, timer: timer)
                }
            } else {
                onComplete(nil, "Unknown error")
            }
        }
    }

}
