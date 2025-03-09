//
//  LoginPageController.swift
//  ios
//
//  Created by Dev on 8/7/23.
//


import SwiftUI
import AuthenticationServices
import GoogleSignIn
import CryptoKit
import GoogleSignInSwift
import Alamofire



struct OauthSignInInfo: Codable {
    var provider: String
    var id: String
    var email: String
    var name: String
    var accessToken: String
    var refreshToken: String? = nil
    var idToken: String
}


func handleSignInButton() {
    let rootViewController = UIApplication.shared.windows.first?.rootViewController

    GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController!) { signInResult, error in
        guard let result = signInResult else {
            // Inspect error
            print("error signing in")
            print(error as Any)
            return
        }
        let serverAuthCode = signInResult?.serverAuthCode
        let user = signInResult!.user

        let profile = user.profile
        let googleUserId = user.userID
        let email = profile!.email
        let name = profile!.name
        let accessToken = user.accessToken.tokenString
        let refreshToken = user.refreshToken.tokenString
        let idToken = user.idToken!.tokenString
        DispatchQueue.main.async {
            globalLoginPageStore.status = "Authenticating..."
        }
        
        postOauthToken(token: idToken, provider: "google", onComplete: { (response, error) in
            if let error = error {
                print(error)
                DispatchQueue.main.async {
                    globalLoginPageStore.error = error.localizedDescription ?? "Error logging in, please contact support as this should not happen like this."
                }
                return
            }
            if let response = response {
                print(response)
            }
        })
    }
}

func postOauthToken(token: String, provider: String, onComplete: @escaping (Any?, Error?) -> Void) {
    let parameters: [String: Any] = [
        "token": token,
        "provider": provider
    ]

    AF.request(api_origin + "/api/oauth-login", method: .post, parameters: parameters, encoding: JSONEncoding.default)
    // curl debug
    .cURLDescription { description in
        print(description)
    }
    // set to AuthenticatedUser object
    .responseJSON { response in
        print(response)
        switch response.result {
        case .success(let value):
            let json = value as! [String: Any]
            if let errorMsg = json["error"] {
                let error = NSError(domain: "", code: 401, userInfo: [ NSLocalizedDescriptionKey: errorMsg])
                onComplete(nil, error)
                return
            }
            let authenticatedUser = json["authenticatedUser"] as! [String: Any]
            let userData = AuthenticatedUser()
            userData.id = authenticatedUser["id"] as! Int
            userData.name = authenticatedUser["name"] as? String ?? ""
            userData.email = authenticatedUser["email"] as? String ?? ""
            userData.agreesToTerms = authenticatedUser["agreesToTerms"] as? Bool ?? false
            userData.creditsRemaining = authenticatedUser["creditsRemaining"] as! Int
            DispatchQueue.main.async {
                globalStore.setUserData(userData: userData, token: json["token"] as! String)
                onComplete(json, nil)
            }
            // update in main thread
        case .failure(let error):
            print("error doing request", error)
            onComplete(nil, error)
        }
    }
}