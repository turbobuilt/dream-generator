//
//  LoginPageView.swift
//  ios
//
//  Created by Dev on 8/7/23.
//


import SwiftUI
import Firebase
import AuthenticationServices
import GoogleSignIn
import CryptoKit
import GoogleSignInSwift


struct LoginPageView_Previews: PreviewProvider {
    static var previews: some View {
        LoginPageView()
    }
}

class LoginPageStore:  NSObject, ObservableObject  {
    @Published var error = ""
    @Published var status = ""
}
let globalLoginPageStore = LoginPageStore()

struct LoginPageView: View {
    @State private var email = ""
    @State private var password = ""
    @StateObject var loginPageStore = globalLoginPageStore
    let gradient = Gradient(colors: [.blue, .purple])

    var body: some View {
        VStack{
            VStack{
                // Spacer()
                Text("DreamGenerator.AI")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(Color.white)
                    .padding(.bottom, 20)

                Text("Find happiness generating images that show whatever you think is great.  Share them and spread the love with friends and family.")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(Color.white)
                    .padding(.bottom, 20)
                    // center text
                    .multilineTextAlignment(.center)

                Text("Welcome to DreamGenerator.ai")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(Color.white)
                    .padding(.bottom, 20)
                
                Divider().background(Color.gray).shadow(radius: 10).padding(10)
                SignInWithAppleButton(.signIn, onRequest: { (request) in
                    print("Requested", request)
                    DispatchQueue.main.async {
                        self.loginPageStore.error = ""
                        self.loginPageStore.status = ""
                    }
                    request.requestedScopes = [.fullName, .email]

                    // Create your request here
                }, onCompletion: { (result) in
                    print(result)
                    switch result {
                    case .success(let authResults):
                        print("Authorize: \(authResults)")
                        let credential = authResults.credential as? ASAuthorizationAppleIDCredential
                        let authorizationCode = credential?.authorizationCode
                        let codeString = String(data: authorizationCode!, encoding: .utf8)
                        print("codeString", codeString)

                        let email = credential?.email
                        let name = credential?.fullName // givenName, familyName
                        let idToken = credential?.identityToken
                        DispatchQueue.main.async {
                            self.loginPageStore.status = "Authenticating..."
                        }
                        
                        postOauthToken(token: (idToken?.base64EncodedString())!, provider: "apple", onComplete: { (response, error) in
                            if let error = error {
                                print(error)
                                DispatchQueue.main.async {
                                    self.loginPageStore.error = error.localizedDescription ?? "Error logging in, please contact support as this should not happen like this."
                                }
                                return
                            }
                            if let response = response {
                                print(response)
                            }
                        })
                    case .failure(let error):
                        print("Error: \(error)")
                    }
                }).frame(maxHeight: 50)
                Divider().background(Color.gray).shadow(radius: 10).padding(10)
                    
                Button(action: {
                    self.loginPageStore.error = ""
                    self.loginPageStore.status = ""
                    handleSignInButton()
                }) {
                    HStack {
                        Spacer()
                        Image("google")
                            .resizable()
                            .frame(width: 20, height: 20)
                        Text("Sign in with Google")
                            .font(.headline)
                            .fontWeight(.medium)
                            .foregroundColor(Color.black)
                            // .padding(.leading, 10)
                        Spacer()
                    }.frame(height: 50)
                }.background(Color.white)
                // full width
                .frame(maxWidth: .infinity)
                .cornerRadius(6)
                
                Divider().background(Color.gray).shadow(radius: 10).padding(10)
                Group {
                    if loginPageStore.status != "" {
                        Text(loginPageStore.status)
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(Color.white)
                            .padding(.bottom, 20)
                            // center text
                            .multilineTextAlignment(.center)
                        Divider().background(Color.gray).shadow(radius: 10).padding(10)
                    }
                    Spacer()
                    // error
                    if loginPageStore.error != "" {
                        VStack {
                        Text(loginPageStore.error) 
                            .foregroundColor(.red)
                            .padding(EdgeInsets(top: 5, leading: 15, bottom: 5, trailing: 15))
                        }.background(Color.white)
                        .cornerRadius(10)
                    }
                }
            }
            .padding(20)
        }.background(LinearGradient(gradient: gradient, startPoint: .top, endPoint: .bottom))
            .frame(minHeight: 400, maxHeight: .infinity)
    }
}
