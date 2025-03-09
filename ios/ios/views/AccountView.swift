//
//  AccountView.swift
//  ios
//
//  Created by Dev on 8/21/23.
//

import SwiftUI

struct AccountView: View {
    var body: some View {
        Text("Your Account")
        // navigation link to advanced acccount view
        NavigationLink(destination: AdvancedAccountView()) {
            Text("Advanced")
        }
    }
}

struct AccountView_Previews: PreviewProvider {
    static var previews: some View {
        AccountView()
    }
}
