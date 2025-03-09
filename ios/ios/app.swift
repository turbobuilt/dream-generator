//
//  iosApp.swift
//  ios
//
//  Created by Dev on 8/7/23.
//


import SwiftUI
import AuthenticationServices
import GoogleSignIn
import CryptoKit
import GoogleSignInSwift
import Combine
import StoreKit


#if DEBUG
 let api_origin = "http://172.20.10.3:5005"
//let api_origin = "http://10.42.0.49:5005"
//let api_origin = "http://192.168.1.12:5005"
//let api_origin = "https://api.dreamgenerator.ai"
#else
let api_origin = "https://api.dreamgenerator.ai"
#endif



var globalStore = GlobalStore()


@main
struct iosApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    var store = globalStore
    var body: some Scene {
        WindowGroup {
            MainView()
        }
    }
}

let iapObserver = StoreObserver()
class AppDelegate: UIResponder, UIApplicationDelegate {
    // Attach an observer to the payment queue.
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        let defaults = UserDefaults.standard
        globalStore.userToken = defaults.string(forKey: "token") ?? ""
        globalStore.loadAuthenticatedUser()
        SKPaymentQueue.default().add(iapObserver)
        return true
    }

    // The system calls this when the app is about to terminate.
    func applicationWillTerminate(_ application: UIApplication) {
        SKPaymentQueue.default().remove(iapObserver)
    }
}

extension UIApplication {

    /// Dismisses the keyboard from the key window of the
    /// shared application instance.
    ///
    /// - Parameters:
    ///     - force: specify `true` to force first responder to resign.
    open class func endEditing(_ force: Bool = false) {
        shared.endEditing(force)
    }

    /// Dismisses the keyboard from the key window of this 
    /// application instance.
    ///
    /// - Parameters:
    ///     - force: specify `true` to force first responder to resign.
    open func endEditing(_ force: Bool = false) {
        keyWindow?.endEditing(force)
    }

}


class GlobalStore: NSObject, ObservableObject {
    @Published var userToken = ""

    func setUserData(userData: AuthenticatedUser, token: String) {
        globalAuthenticatedUser.setValues(newAuthenticatedUser: userData)
        self.userToken = token
        self.saveUserData()
    }
    func saveUserData() {
        UserDefaults.standard.set(globalAuthenticatedUser.id, forKey: "id")
        UserDefaults.standard.set(globalAuthenticatedUser.name, forKey: "name")
        UserDefaults.standard.set(globalAuthenticatedUser.email, forKey: "email")
        UserDefaults.standard.set(globalAuthenticatedUser.creditsRemaining, forKey: "creditsRemaining")
        UserDefaults.standard.set(globalAuthenticatedUser.agreesToTerms, forKey: "agreesToTerms")
        UserDefaults.standard.set(self.userToken, forKey: "userToken")
        self.loadAuthenticatedUser()
    }

    func logout() {
        globalAuthenticatedUser = AuthenticatedUser()
        UserDefaults.standard.removeObject(forKey: "userData")
        UserDefaults.standard.removeObject(forKey: "userToken")
    }

    func loadAuthenticatedUser() {
        print("token is ", self.userToken)
        self.userToken = UserDefaults.standard.string(forKey: "userToken") ?? ""
        globalAuthenticatedUser.id = UserDefaults.standard.integer(forKey: "id")
        globalAuthenticatedUser.name = UserDefaults.standard.string(forKey: "name") ?? ""
        globalAuthenticatedUser.email = UserDefaults.standard.string(forKey: "email") ?? ""
        globalAuthenticatedUser.creditsRemaining = UserDefaults.standard.integer(forKey: "creditsRemaining")
        globalAuthenticatedUser.agreesToTerms = UserDefaults.standard.bool(forKey: "agreesToTerms")
        print("loaded user data", globalAuthenticatedUser.id, "agrees", globalAuthenticatedUser.agreesToTerms, "token", self.userToken, "credits Remaining", globalAuthenticatedUser.creditsRemaining)
    }

    func userAgreesToTerms(onError: @escaping (String) -> Void, onSuccess: @escaping () -> Void) {
        GetRequest(url: "/api/user-agrees", onComplete: { data, error in
            DispatchQueue.main.async {
                if error != nil {
                    onError(error!)
                    return
                }
                let alreadyAgrees2 = data!["alreadyAgrees"] as? Bool
                print(alreadyAgrees2)
                if let alreadyAgrees = data!["alreadyAgrees"] as? Bool, alreadyAgrees == true {
                    globalAuthenticatedUser.creditsRemaining = data!["creditsRemaining"] as! Int
                    globalAuthenticatedUser.agreesToTerms = true
                    globalStore.saveUserData()
                    onSuccess()
                    return
                }
                if let errorMessage = data!["error"] {
                    onError(errorMessage as! String)
                    return
                }
                globalAuthenticatedUser.creditsRemaining = data!["creditsRemaining"] as! Int
                globalAuthenticatedUser.agreesToTerms = true
                globalStore.saveUserData()
                onSuccess()
            }
        })
    }
}

func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    var handled: Bool

    handled = GIDSignIn.sharedInstance.handle(url)
    if handled {
        return true
    }

    return false
}
