import SwiftUI

class DisplayAllImagesLoader: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @Published var imagePaths: [String] = []
    // @Published var 
    override  init() {
        super.init()
        loadImagePaths()
    }

    func loadImagePaths() {
        self.imagePaths = getImagesFromDirectory()
        if imagePaths.count == 0 {
            DispatchQueue.main.async {
                print("setting default prompt")
                // globalCreateImageViewData.prompt = "A stunning image of two people kissing on the cheeks.  They are a man and woman and they are happy and free.  They both love each other and their bodies are perfectly formed and beautiful.  The woman has green eyes you can see and the man is tall and strong.  They forgive each other and are having a great time being together just like their family.  Digital Art."
                globalCreateImageViewData.selectedStyle = "Anime"
            }
        }
    }
}

// constant displayAllImagesLoader
let globalDisplayAllImagesLoader = DisplayAllImagesLoader()

class DisplayAllImagesViewStore: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @Published var imageUrl: String?
    @Published var showSheet = false
}

let globalDisplayAllImagesViewStore = DisplayAllImagesViewStore()

struct DisplayAllImagesView: View {
    @StateObject private var displayAllImagesLoader = globalDisplayAllImagesLoader
    @StateObject private var displayAllImagesViewStore = globalDisplayAllImagesViewStore
    @State private var selectedImagePath: String = ""
    
    var body: some View {
        VStack {
        if displayAllImagesLoader.imagePaths.count == 0 {
            VStack {
                Text("Welcome to DreamGenerator.ai. Thanks for trying my latest app!  You will be amazed by the quality of the images.  Sometimes they aren't perfect, but they always entertain.  Have fun! You all are amazing.")
                // center
                .multilineTextAlignment(.center)
                .padding(30)
                Text("To get started, type a prompt below!")
                // center
                .multilineTextAlignment(.center)
                .padding(30)
            }
        } else {
            ScrollView {
                LazyVGrid(columns: Array(repeating: .init(.flexible()), count: 3), spacing: 10) {
                    ForEach(displayAllImagesLoader.imagePaths, id: \.self) { imagePath in
                        let image = UIImage(contentsOfFile: imagePath)!
                        
                        Button(action: {
                            self.selectedImagePath = imagePath
                            self.displayAllImagesViewStore.showSheet = true
                            displayAllImagesViewStore.imageUrl = imagePath
                            print("image path is", imagePath, "Was image path")
                        }) {
                            Image(uiImage: image)
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: UIScreen.main.bounds.width / 3 - 10)
                        }
                    }
                }
            }
            // padding 10px left and right 0px top and bottom
            .padding(EdgeInsets(top: 2, leading: 10, bottom: 0, trailing: 10))
            .onAppear {
                displayAllImagesLoader.loadImagePaths()
            }
                .sheet(isPresented: $displayAllImagesViewStore.showSheet, onDismiss: {
                    self.displayAllImagesViewStore.showSheet = false
                    displayAllImagesLoader.loadImagePaths()
            }) {
                DisplayImageView(imageUrl: displayAllImagesViewStore.imageUrl!)
            }
        }
        }.padding(0)
    }
}


struct DisplayAllImagesView_Previews: PreviewProvider {
    static var previews: some View {
        DisplayAllImagesView()
    }
}
