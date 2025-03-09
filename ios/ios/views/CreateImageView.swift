//
//  CreateImageView.swift
//  ios
//
//  Created by Dev on 8/7/23.
//

import SwiftUI

extension UIView{
 override open func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {  
    UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
  }
}

class CreateImageViewData: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @Published var styleImageNames: [String] = ["Anime","Fantasy Art","Photorealistic","3D Cartoon","Digital Art", "None"]
    @Published public var showInAppPurchase: Bool = false
    @Published public var error: String = ""
    @Published var prompt: String = ""
    @Published var selectedStyle: String = "None"
    @Published public var processing = false
    @Published public var processingStatus = ""

    override init() {
        super.init()
        // load all images in the "styles" in xcassets
    }
}

let globalCreateImageViewData = CreateImageViewData()

struct CreateImageView: View {
    @State var navPath = NavigationPath()
    @State var imageUrl: String = ""
    @State var showImage: Bool = false
    @StateObject var createImageViewData = globalCreateImageViewData


    // this is a function called imageGenerated that receives an imageUrl parameter.  It downloads the image and displays it
    func imageGenerated(imageUrl: String?, error: String?) {
        print("generated image", imageUrl, error)
        self.createImageViewData.error = ""
        if let error = error {
            self.createImageViewData.processing = false
            print("error", error)
            // if error domain is 'insufficient_credits' then showInAppPurchase = true
            if error == "insufficient_credits" {
                self.createImageViewData.showInAppPurchase = true
                return
            } else {
                self.createImageViewData.error = error
            }
        } else if let imageUrl = imageUrl {
            print("image generated", imageUrl)
            DispatchQueue.main.async {
                if globalDisplayAllImagesViewStore.showSheet == true {
                    print("hiding sheet!")
                    // wait 1 second 
                    globalDisplayAllImagesViewStore.showSheet = false
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                        self.imageUrl = imageUrl
                        self.showImage = true
                    }
                } else {
                    print("Sheet already hidden")
                    self.imageUrl = imageUrl
                    self.showImage = true
                }
            }
            // // navigate to DisplayImageView with the NavigationStack
            // // with imageUrl as a parameter
            // self.imageUrl = imageUrl
            // self.showImage = true
        } else if let error = error {
            self.createImageViewData.processing = false
            print("error", error)
        }
    }
    
    var body: some View {
        // a horizontal line
        VStack {
            // Divider().background(Color.black).shadow(radius: 10).padding(0)
            TextField(
                "What do you want to see? Use as much detail as you feel!",
                text: $createImageViewData.prompt,
                axis: .vertical
            )
            // .textInputAutocapitalization(.never)
            // .disableAutocorrection(true)
            .cornerRadius(4)
            .lineLimit(2...15)
            // padding 15px on left, right, bottom, 0px top
            .padding(EdgeInsets(top: 8, leading: 15, bottom: 0, trailing: 15))
            .disabled(self.createImageViewData.processing)

            // horizontal sliding view showing 256pxx256px images. The images scroll across horizontally and the selected
            // use createImageViewData.styleImageNames to populate the list. These images are in the "styles" folder in xcassets
            // when the user clicks on an image, set the selectedStyle to the name of the image
            // if selected, the image should have a blue border around it

            ScrollView(.horizontal) {
                HStack {
                    ForEach(createImageViewData.styleImageNames, id: \.self) { styleImageName in
                        ZStack(alignment: .bottomLeading) {
                            Image(styleImageName)
                                .resizable()
                                .frame(width: 96, height: 96)
                                .onTapGesture {
                                    createImageViewData.selectedStyle = styleImageName
                                }
                            // align center
                            VStack(alignment: .center) {
                                Text(styleImageName)
                                .padding(EdgeInsets(top: 0, leading: 5, bottom: 3, trailing: 5))
                                .opacity(0.9)
                            }
                            .frame(width: 96, height: 20)
                            // make it 10% see through
                            .background(Color.white)
                            .opacity(0.7)
                                // pad left and right 5 px, top and bottom 0
                                // .foregroundColor(.white)
                                // .font(.headline)
                                // .padding(5)
                                // .background(Color.black)
                                // .cornerRadius(5)
                                // .opacity(selectedStyle == styleImageName ? 1 : 0)
                        }.border(Color.blue, width: createImageViewData.selectedStyle == styleImageName ? 4 : 0)
                    }
                }
            }
            // padding 15px on left, right, bottom, 0px top
            .padding(EdgeInsets(top: 0, leading: 15, bottom: 0, trailing: 15))
            if createImageViewData.error != "" {
                Text(createImageViewData.error)
                    .foregroundColor(.red)
                    .padding(EdgeInsets(top: 5, leading: 15, bottom: 5, trailing: 15))
            }
            Button(action: {
                self.createImageViewData.processing = true
                self.createImageViewData.error = ""
                createImageButtonPressed(prompt: createImageViewData.prompt, style: createImageViewData.selectedStyle, onStatusUpdate: { status in
                    createImageViewData.processingStatus = status
                }, onComplete: { imageUrl, error in
                    if imageUrl == nil && error == nil {
                        return
                    }
                    self.createImageViewData.processing = false
                    DispatchQueue.main.async {
                        createImageViewData.processingStatus = ""
                    }
                    imageGenerated(imageUrl: imageUrl, error: error)
                })
            }) {
                if self.createImageViewData.processing  {
                    Text("Processing... " + createImageViewData.processingStatus)
                        .font(.headline)
                        // .foregroundColor(.white)
                        .padding(10)
                        // .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                        // .padding(EdgeInsets(top: 5, leading: 10, bottom: 5, trailing: 10))
                } else {
                Text("Create Image")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                    .padding(EdgeInsets(top: 5, leading: 10, bottom: 5, trailing: 10))
                }
            }.cornerRadius(5)
            .sheet(isPresented: $showImage, onDismiss: {
                self.showImage = false
                globalDisplayAllImagesLoader.loadImagePaths()
            }) {
                DisplayImageView(imageUrl: self.imageUrl)
            }
            .sheet(isPresented: $createImageViewData.showInAppPurchase, onDismiss: {
                self.createImageViewData.showInAppPurchase = false
            }) {
                InAppPurchaseView()
            }
        }
    }
}

struct CreateImageView_Previews: PreviewProvider {
    static var previews: some View {
        CreateImageView()
    }
}
