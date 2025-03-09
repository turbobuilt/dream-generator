//
//  TopBarView.swift
//  ios
//
//  Created by Dev on 8/9/23.
//

import SwiftUI


class TopBarViewData: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @Published var showInAppPurchase = false
}

let globalTopBarViewData = TopBarViewData()

struct TopBarView: View {
    @ObservedObject var store = globalStore
    @ObservedObject var topBarViewData = globalTopBarViewData
    @ObservedObject var authenticatedUser = globalAuthenticatedUser

    var body: some View {
        HStack(alignment: .center) {
            Text(authenticatedUser.name ?? "Hello!")
            Spacer()
            Text(authenticatedUser.creditsRemaining.description + " Credits")
                .onTapGesture {
                    self.topBarViewData.showInAppPurchase = true
                }
            .sheet(isPresented: $topBarViewData.showInAppPurchase, onDismiss: {
                self.topBarViewData.showInAppPurchase = false
            }) {
                InAppPurchaseView()
            }
        }// padding left right 10px top bottom 0
        .padding(EdgeInsets(top: 0, leading: 20, bottom: 10, trailing: 20))
        // white text
        .foregroundColor(.white)
        // background blue purple gradient
        .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
    }
}

struct TopBarView_Previews: PreviewProvider {
    static var previews: some View {
        TopBarView()
    }
}
