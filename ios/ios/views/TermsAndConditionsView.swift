//
//  TermsAndConditionsView.swift
//  ios
//
//  Created by Dev on 8/13/23.
//

import SwiftUI
import WebKit

struct TermsAndConditionsView: View {
    @State var agrees = false
    @State var error = ""
    @Environment(\.dismiss) private var dismiss


    var body: some View {
        Text("Hi, Welcome to the App")
            .padding(20)
            .font(.title).bold()
            .multilineTextAlignment(.center)
        Text("Before we get started, we just want to make one thing clear.  I can't afford to give this away for free because it's expensive. One day it will be cheap, but for now it's costs a lot.")
            .padding(20)
            .font(.body)
            .multilineTextAlignment(.center)
        Text("No making fake accounts to get free credits! That's it.")
            .padding(20)
            .font(.title3)
            // center
            .multilineTextAlignment(.center)

            
        // // webview that shows terms - link to https://dreamgenerator.ai/terms
        // Text("Terms and Conditions")
        //     .padding(20)
        //     .font(.title3)
        //     .multilineTextAlignment(.center)
        // WebView(url: URL(string: "https://dreamgenerator.ai/terms")!)
        //     .frame(width: 300, height: 300)
        // link to the url
        Link("Terms of Service", destination: URL(string: "https://dreamgenerator.ai/terms")!)
            .padding(10)
        Link("Privacy", destination: URL(string: "https://dreamgenerator.ai/terms")!)
            .padding(10)
        // Text("Privacy")
        //     .padding(20)
        //     .font(.title3)
        //     .multilineTextAlignment(.center)
        // WebView(url: URL(string: "https://dreamgenerator.ai/privacy")!)
        //     .frame(width: 300, height: 300)
        

        // checkbox that says "I will only make one account for credits"
        // on change call function
        Toggle(isOn: $agrees) {
            Text("I will only make one account for credits")
            .multilineTextAlignment(.center)
        }
        .padding(20)
        .font(.body)
        .onChange(of: agrees) { value in
            print("agrees", value)
            if value == true {
                globalStore.userAgreesToTerms(onError : { error in
                    self.error = error
                }, onSuccess: {
                    dismiss()
                })
            } else {
                
            }
        }
        if error != "" {
            Text(error)
                .padding(20)
                .font(.body)
                .multilineTextAlignment(.center)
        }
    }
}

struct TermsAndConditionsView_Previews: PreviewProvider {
    static var previews: some View {
        TermsAndConditionsView()
    }
}
