import StoreKit

class PurchaseHandler: NSObject, SKProductsRequestDelegate {

    var products = [SKProduct]()
    var onFetch: (([SKProduct]) -> ())?
    
    // fetch products on init
    override init() {
        super.init()
        // call fetchProducts
        fetchProducts { (products) in
            print("got products", products)
        }
    }

    func fetchProducts(complete: @escaping([SKProduct]) -> ()) {
        print("will fetch")
        let productIdentifiers = Set(["ai.dreamgenerator.big_plan"])
        let productRequest: SKProductsRequest = SKProductsRequest(productIdentifiers: productIdentifiers)
        productRequest.delegate = self
        self.onFetch = complete
        productRequest.start()
    }
    
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        print("got products", response.products)
        if response.invalidProductIdentifiers.count == 0 {
            self.products = response.products
        }
        self.onFetch?(response.products)
    }

    //on failure
    func request(_ request: SKRequest, didFailWithError error: Error) {
        print("request failed")
    }

    func purchase(product: SKProduct) {
        print("purchasing")
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }
}


class StoreObserver: NSObject, SKPaymentTransactionObserver {
    override init() {
        super.init()
    }
    
    //Observe transaction updates.
    func paymentQueue(_ queue: SKPaymentQueue,updatedTransactions transactions: [SKPaymentTransaction]) {
        //Handle transaction states here.
        print("transaction complete")
        for transaction in transactions {
            print(transaction.transactionIdentifier)
            if transaction.transactionState == .purchased {
                print("Transaction successful.")
                // get receipt
                let receiptUrl = Bundle.main.appStoreReceiptURL
                let receipt = NSData(contentsOf: receiptUrl!)
                DispatchQueue.main.async {
                    globalInAppPurchaseViewData.processingStatusText = "Verifying Purchase"
                }
                submitTransactionToServer(transaction: transaction)
                // Your code here to handle a successful purchase.
            } else if transaction.transactionState == .failed {
                print("Transaction failed.")
                DispatchQueue.main.async {
                    globalInAppPurchaseViewData.error = "Transaction failed. " + transaction.error.debugDescription
                    globalInAppPurchaseViewData.processingStatusText = ""
                }
                // Your code here to handle a failed purchase.
            }
        }
    }
}

func submitTransactionToServer(transaction: SKPaymentTransaction) {
    print("submitting to server")
    let receiptUrl = Bundle.main.appStoreReceiptURL
    let receipt = NSData(contentsOf: receiptUrl!)
    let receiptData = receipt?.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0))
    let body = ["receipt": receiptData, "transactionIdentifier": transaction.transactionIdentifier]
    let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
    var request = URLRequest(url: URL(string: api_origin + "/api/client-verify-ios-transaction")!)
    request.setValue(globalStore.userToken, forHTTPHeaderField: "AuthorizationToken")
    request.httpMethod = "POST"
    request.httpBody = bodyData
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("error", error)
            DispatchQueue.main.async {
                globalInAppPurchaseViewData.error = "Error verifying - contact support@dreamgenerator.ai. Purchase was successful most likely, but network error or server error.  Don't repurchase unless you think there was a legitimate network error. Contact support@dreamgenerator.ai.  Sorry about the issue, working on improving this over time! Details:" + error.localizedDescription
                globalInAppPurchaseViewData.processingStatusText = ""
            }
            return
        }
        let response = try? JSONSerialization.jsonObject(with: data!, options: [])
        print("response", response)
        // extract creditsRemaining: Int, newCredits: Int
        if let json = response as? [String: Any] {
            // finish transaction
            if let creditsRemaining = json["creditsRemaining"] as? Int {
                SKPaymentQueue.default().finishTransaction(transaction)
                DispatchQueue.main.async {
                    globalAuthenticatedUser.creditsRemaining = creditsRemaining
                    // save
                    globalStore.saveUserData()
                    globalCreateImageViewData.showInAppPurchase = false
                    globalInAppPurchaseViewData.processingStatusText = ""
                    globalInAppPurchaseViewData.error = ""
                    globalInAppPurchaseViewData.successText = "Success!"
                    // change it back after 2 seconds and hide
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        globalInAppPurchaseViewData.successText = ""
                        globalTopBarViewData.showInAppPurchase = false
                    }
                }
            } else if let error = json["error"] as? String {
                print("error", error)
                DispatchQueue.main.async {
                    globalInAppPurchaseViewData.error = "Error verifying - contact support@dreamgenerator.ai. Purchase was successful most likely, but network error or server error.  Don't repurchase unless you think there was a legitimate network error. Contact support@dreamgenerator.ai.  Sorry about the issue, working on improving this over time! Details:" + error
                    globalInAppPurchaseViewData.processingStatusText = ""
                }
            }
            if let newCredits = json["newCredits"] as? Int {
                print("added", newCredits, "credits")
            }
        }
    }
    task.resume()
}

func showIapDialog(on viewController: UIViewController, success: @escaping () -> Void, error: @escaping (Error) -> Void) {
    let purchase = PurchaseHandler()
    purchase.fetchProducts {(products) in
        let alert = UIAlertController(title: "Available Purchases", message: nil, preferredStyle: .alert)
        for product in products {
            alert.addAction(UIAlertAction(title: "\(product.localizedTitle) - \(product.localizedDescription) for \(product.price)", style: .default, handler: { (_) in
                let payment = SKMutablePayment(product: product)
                SKPaymentQueue.default().add(payment)
            }))
        }
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        DispatchQueue.main.async {
            viewController.present(alert, animated: true)
        }
    }
}
