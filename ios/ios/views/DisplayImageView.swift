import SwiftUI
import Combine

func getPromptFileUrl(imageUrl: String) -> String {
    let fileName = imageUrl.components(separatedBy: "/").last!.components(separatedBy: ".").first!
    // imageUrl is in images dir.  promptUrl is in prompts dir
    // create directory if not exists
    let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    let promptDirectory = documentsDirectory.appendingPathComponent("prompts")
    let promptUrl = promptDirectory.appendingPathComponent(fileName).appendingPathExtension("txt").path
    do {
        try FileManager.default.createDirectory(at: promptDirectory, withIntermediateDirectories: true, attributes: nil)
    } catch {
        print("error creating prompts directory", error)
    }
    print("prompt url is", promptUrl)
    return promptUrl                            
}

func getPromptForImage(imageUrl: String) -> String? {
    let promptUrl = getPromptFileUrl(imageUrl: imageUrl)
    do {
        let prompt = try String(contentsOfFile: promptUrl)
        return prompt
    } catch {
        print("error getting prompt", error)
        return nil
    }
}
func savePromptForImage(imageUrl: String, prompt: String) {
    let promptUrl = getPromptFileUrl(imageUrl: imageUrl)
    print("saving prompt", prompt, "to image url", promptUrl)
    do {
        try prompt.write(toFile: promptUrl, atomically: true, encoding: .utf8)
    } catch {
        print("error saving prompt", error)
    }
}
func deletePromptForImage(imageUrl: String) {
    let promptUrl = getPromptFileUrl(imageUrl: imageUrl)
    do {
        try FileManager.default.removeItem(atPath: promptUrl)
    } catch {
        print("error deleting prompt", error)
    }
}

class ImageLoader: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    @Published var localImageUrl: String?
    @Published var image: UIImage?
    @Published var error: String?
    @Published var saveMessage: String?
    @Published var saving: Bool = false
    @Published var isLocalImage: Bool = false
    var presentationMode: Binding<PresentationMode>?

    func getImage(imageUrl: String) {
        if imageUrl.starts(with: "http") {
            saveImageToDocumentsDirectory(url: imageUrl, onComplete: { (localUrl, error) in
                if let localUrl = localUrl {
                    print("image saved", localUrl)
                    // now save prompt
                    let prompt = globalCreateImageViewData.prompt
                    savePromptForImage(imageUrl: localUrl, prompt: prompt)

                    DispatchQueue.main.async {
                        self.setLocalImageUrl(localUrl: localUrl)
                    }
                } else if let error = error {
                    print("error", error)
                }
            }, onConvert: { (localUrl, error) in
                self.localImageUrl = localUrl
            })
        } else {
            self.isLocalImage = true
            self.setLocalImageUrl(localUrl: imageUrl)
        }
    }
    
    func setLocalImageUrl(localUrl: String) {
        self.localImageUrl = localUrl
        self.image = UIImage(contentsOfFile: self.localImageUrl!)
    }
    
    func saveToPhotos(presentationMode: Binding<PresentationMode>) {
        self.saving = true
        self.presentationMode = presentationMode
        if let localImageUrl = localImageUrl {
            UIImageWriteToSavedPhotosAlbum(UIImage(contentsOfFile: localImageUrl)!, self, #selector(saveCompleted), nil)
        }
    }

    @objc func saveCompleted(_ image: UIImage, didFinishSavingWithError error: Error?, contextInfo: UnsafeRawPointer) {
        self.saving = false
        if let saveError = error {
            print("error", saveError)
            self.error = "Error: \(saveError.localizedDescription)"
        } else {
            // Image saved successfully
            print("image saved")
            self.saveMessage = "Saved!"
            // close after 3 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                self.presentationMode?.wrappedValue.dismiss()
            }
        }
    }
}

struct DisplayImageView: View {
    let imageUrl: String
    @StateObject private var imageLoader: ImageLoader
    @Environment(\.presentationMode) var presentationMode
    @State var showDeleteMessage: Bool = false


    init(imageUrl: String) {
        self.imageUrl = imageUrl
        self._imageLoader = StateObject(wrappedValue: ImageLoader())
    }
    
    var body: some View {
        VStack{
            GeometryReader{ proxy in
                if imageLoader.image != nil {
                    ZoomImageView(uiImage: imageLoader.image!)
                        .frame(width: proxy.size.width)
                } else {
                    VStack {
                        Spacer()
                        Text("Downloading Your Image!")
                            .font(.subheadline)
                        // .foregroundColor(.white)
                            .padding()
                            .padding(EdgeInsets(top: 0, leading: 10, bottom: 10, trailing: 10))
                            .frame(maxWidth: .infinity)
                        // .background(Color.green).frame(maxWidth: .infinity)
                        
                        ProgressView()
                        // padding 100px top
                            .padding(.top, 100)
                            .frame(width: proxy.size.width)
                        // text that says "Downloading Your Image!"
                        Spacer()
                    }.padding(15)
                }
            }
            VStack {
                if imageLoader.image != nil {
                    if imageLoader.saveMessage != nil {
                        // background beautiful green, color is white, padding and big text, full width, wrap in RoundedRectangle
                        GeometryReader{ proxy in
                            VStack {
                                Text(imageLoader.saveMessage!)
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .padding()
                                // .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                                    .padding(EdgeInsets(top: 5, leading: 10, bottom: 5, trailing: 10))
                                    .frame(maxWidth: .infinity)
                            }.background(Color.green).frame(maxWidth: .infinity)
                        }
                    }
                    if imageLoader.error != nil {
                        // background beautiful red, color is white, padding and big text, full width, wrap in RoundedRectangle
                        GeometryReader{ proxy in
                            VStack {
                                Text(imageLoader.error!)
                                    .font(.title)
                                    .foregroundColor(.white)
                                    .padding()
                                    .frame(maxWidth: .infinity)
                            }.background(Color.red).frame(maxWidth: .infinity)
                        }
                    }
                    if imageLoader.saveMessage == nil && !imageLoader.saving {
                        // delete image button
                        Button(action: {
                            if showDeleteMessage {
                                showDeleteMessage = false
                                if let localImageUrl = imageLoader.localImageUrl {
                                    do {
                                        try FileManager.default.removeItem(atPath: localImageUrl)
                                        imageLoader.localImageUrl = nil
                                        imageLoader.image = nil
                                        imageLoader.error = nil
                                        imageLoader.saveMessage = nil
                                        
                                        deletePromptForImage(imageUrl: localImageUrl)
                                        
                                        DispatchQueue.main.async {
                                            self.presentationMode.wrappedValue.dismiss()
                                        }
                                    } catch {
                                        print("error deleting image", error)
                                    }
                                }
                            } else {
                                showDeleteMessage = true
                            }
                        }) {
                            Text(showDeleteMessage ? "Push Again to Delete" : "Delete Image")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding()
                                .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                                .padding(EdgeInsets(top: 5, leading: 10, bottom: 5, trailing: 10))
                        }.padding(7)
                    }
                    if imageLoader.isLocalImage {
                        Button(action: {
                            let prompt = getPromptForImage(imageUrl: imageLoader.localImageUrl!)
                            DispatchQueue.main.async {
                                globalCreateImageViewData.prompt = prompt ?? ""
                            }
                            self.presentationMode.wrappedValue.dismiss()
                        }) {
                            Text("Replay Prompt")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding()
                                .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                                .padding(EdgeInsets(top: 5, leading: 10, bottom: 5, trailing: 10))
                        }
                    }
                    if imageLoader.image != nil && imageLoader.saveMessage == nil && !imageLoader.saving {
                        Button(action: {
                            imageLoader.saveToPhotos(presentationMode: self.presentationMode)
                        }) {
                            Text("Save To Photos")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding()
                                .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                                .padding(EdgeInsets(top: 4, leading: 10, bottom: 4, trailing: 10))
                        }.disabled(imageLoader.localImageUrl?.isEmpty ?? false).padding(10)
                    }
                    // if imageLoader.isLocalImage {
                    Button(action: {
                        self.presentationMode.wrappedValue.dismiss()
                    }) {
                        Text("Close")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .background(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .leading, endPoint: .trailing))
                            .padding(EdgeInsets(top: 5, leading: 10, bottom: 5, trailing: 10))
                    }
                    // }
                }
            }.padding(15)
        }
        .onAppear {
            imageLoader.getImage(imageUrl: imageUrl)
        }
    }
}

struct DisplayImagView_Previews: PreviewProvider {
    static var previews: some View {
        DisplayImageView(imageUrl: "https://www.loremflickr.com/1024/1024")
    }
}

struct ZoomableScrollView<Content: View>: UIViewRepresentable {
  private var content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  func makeUIView(context: Context) -> UIScrollView {
    // set up the UIScrollView
    let scrollView = UIScrollView()
    scrollView.delegate = context.coordinator  // for viewForZooming(in:)
    scrollView.maximumZoomScale = 20
    scrollView.minimumZoomScale = 1
    scrollView.bouncesZoom = true

    // create a UIHostingController to hold our SwiftUI content
    let hostedView = context.coordinator.hostingController.view!
    hostedView.translatesAutoresizingMaskIntoConstraints = true
    hostedView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    hostedView.frame = scrollView.bounds
    scrollView.addSubview(hostedView)

    return scrollView
  }

  func makeCoordinator() -> Coordinator {
    return Coordinator(hostingController: UIHostingController(rootView: self.content))
  }

  func updateUIView(_ uiView: UIScrollView, context: Context) {
    // update the hosting controller's SwiftUI content
    context.coordinator.hostingController.rootView = self.content
    assert(context.coordinator.hostingController.view.superview == uiView)
  }

  // MARK: - Coordinator

  class Coordinator: NSObject, UIScrollViewDelegate {
    var hostingController: UIHostingController<Content>

    init(hostingController: UIHostingController<Content>) {
      self.hostingController = hostingController
    }

    func viewForZooming(in scrollView: UIScrollView) -> UIView? {
      return hostingController.view
    }
  }
}


struct ZoomImageView: View {
    @State private var zoom = 1.0
    @State private var totalZoom = 1.0
    @State var uiImage: UIImage

    var body: some View {
        Image(uiImage: uiImage)
            .resizable()
            .scaledToFit()
            .aspectRatio(contentMode: .fit)
            .scaleEffect(zoom)
            .gesture(MagnificationGesture()
            .onChanged({ value in
                zoom = value
            }))
    }
}
