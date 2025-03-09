//
//  InAppPurchaseView.swift
//  ios
//
//  Created by Dev on 8/7/23.
//

import SwiftUI
import StoreKit

class InAppPurchaseViewData: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @Published var products: [SKProduct] = []
    @Published var loading = true
    @Published var error: String = ""
    @Published var processingStatusText: String = ""
    @Published var successText = ""
    let purchaseHandler = PurchaseHandler()

    override init() {
        super.init()
        self.getIapObjects()
    }

    func getIapObjects() {
        print("starting")
        purchaseHandler.fetchProducts { (products) in
            print("products", products)
            // print all product localized descriptions
            for product in products {
                print("title", product.localizedTitle)
                print("description", product.localizedDescription)
            }
            DispatchQueue.main.async {
                self.products = products
                self.loading = false
            }
         }
    }

}

let globalInAppPurchaseViewData = InAppPurchaseViewData()

struct InAppPurchaseView: View {
    @StateObject var inAppPurchaseViewData = globalInAppPurchaseViewData
    
    var body: some View {
        NavigationStack {
            VStack {
                Text("Load Up on Credits!") // padding top 20px
                    .padding(.top, 20)
                    .font(.title).bold()
                    .foregroundColor(Color.black)
                if inAppPurchaseViewData.loading {
                    Text("Loading Credit Packs. Thanks for supporting me as I work to make the world a better place!")
                        .padding(15)
                    //bold
                        .font(.title2)
                } else {
                    if inAppPurchaseViewData.successText != "" {
                        Text(inAppPurchaseViewData.successText)
                            .padding(25)
                        //bold
                            .font(.title2)
                            .foregroundColor(Color.black)
                    }
                    List(inAppPurchaseViewData.products, id: \.self) { product in
                        VStack {
                            HStack(alignment: .top) {
                                VStack(alignment: .leading) {
                                    Text(product.localizedTitle).bold().foregroundColor(Color.black)
                                    // align left
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    // Text(product.localizedDescription)
                                }// make it grow
                                .frame(maxWidth: .infinity)
                                Text(product.priceLocale.currencySymbol! + product.price.stringValue).bold().foregroundColor(Color.black)
                            }
                            if inAppPurchaseViewData.processingStatusText == "" {
                                // Buy button
                                Button(action: {
                                    inAppPurchaseViewData.purchaseHandler.purchase(product: product)
                                }) {
                                    // display price with $ or currency symbol
                                    Text("Buy")
                                    // cool styling with gradient left-right padding 30px top-bottom 5px
                                        .padding(EdgeInsets(top: 5, leading: 30, bottom: 5, trailing: 30))
                                        .background(LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .leading, endPoint: .trailing))
                                        .foregroundColor(.white)
                                        .cornerRadius(5)
                                }// border blue/purple
                                .onTapGesture {
                                    inAppPurchaseViewData.processingStatusText = "IAP Processing..."
                                    inAppPurchaseViewData.purchaseHandler.purchase(product: product)
                                }
                            } else {
                                Text(inAppPurchaseViewData.processingStatusText)
                                    .foregroundColor(Color.black)
                                    .padding(10)
                            }
                        }.foregroundColor(Color.black)
                        // bottom padding 10px
                            .padding(10)
                    }
                }
                
                if inAppPurchaseViewData.error != "" {
                    // surround with white background padding 20px
                    VStack {
                        ScrollView {
                            Text(inAppPurchaseViewData.error)
                                .padding(20)
                                .background(Color.white)
                                .cornerRadius(5)
                            Button(action: {
                                inAppPurchaseViewData.error = ""
                            }) {
                                Text("Close")
                            }
                        }
                    }
                }
                Spacer()
                // link to AccountView
                NavigationLink("Test") {
                    Text("bob jones")
                }
                // NavigationLink(destination: AccountView()) {
                //     Text("Account")
                //         .padding(EdgeInsets(top: 5, leading: 30, bottom: 5, trailing: 30))
                //         .background(LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .leading, endPoint: .trailing))
                //         .foregroundColor(.white)
                //         .cornerRadius(5)
                // }
            }
        }
    }
}

struct InAppPurchaseView_Previews: PreviewProvider {
    static var store: GlobalStore = GlobalStore()
    static var previews: some View {
        InAppPurchaseView()
    }
}
