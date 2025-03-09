//
//  ContentView.swift
//  ios
//
//  Created by Dev on 8/7/23.
//

import SwiftUI

prefix func ! (value: Binding<Bool>) -> Binding<Bool> {
    Binding<Bool>(
        get: { !value.wrappedValue },
        set: { value.wrappedValue = !$0 }
    )
}

struct MainView: View {
    @ObservedObject var store = globalStore
    @ObservedObject var authenticatedUser = globalAuthenticatedUser
    
    var body: some View {
        ZStack {
            ErrorToast()
            VStack {
                if(store.userToken == ""){
                    LoginPageView()
                        // .frame(minHeight: 1000, maxHeight: .infinity)
                }else{
                    NavigationStack{
                        VStack {
                            TopBarView()
                            DisplayAllImagesView().frame(minHeight: 0, maxHeight: .infinity)
                            CreateImageView()
                            .background(Color(red: 0.91, green: 0.91, blue: 0.91))
                            
                        }
                        .sheet(isPresented: !$authenticatedUser.agreesToTerms, onDismiss: {

                        }) {
                            TermsAndConditionsView()
                            .interactiveDismissDisabled(true)
                        }
                    }
                }
            }
        }
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
