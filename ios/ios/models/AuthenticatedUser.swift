//
//  AuthenticatedUser.swift
//  ios
//
//  Created by Dev on 8/13/23.
//

import Foundation

class AuthenticatedUser: NSObject, ObservableObject {
    @Published var id: Int? = nil
    @Published var name = ""
    @Published var email = ""
    @Published var creditsRemaining = 0
    @Published var agreesToTerms = false

    func encode(with coder: NSCoder) {
        coder.encode(id, forKey: "id")
        coder.encode(name, forKey: "name")
        coder.encode(email, forKey: "email")
        coder.encode(creditsRemaining, forKey: "creditsRemaining")
        coder.encode(agreesToTerms, forKey: "agreesToTerms")
    }

    func setValues(newAuthenticatedUser: AuthenticatedUser) {
        self.id = newAuthenticatedUser.id
        self.name = newAuthenticatedUser.name
        self.email = newAuthenticatedUser.email
        self.creditsRemaining = newAuthenticatedUser.creditsRemaining
        self.agreesToTerms = newAuthenticatedUser.agreesToTerms
    }
}

var globalAuthenticatedUser = AuthenticatedUser()
