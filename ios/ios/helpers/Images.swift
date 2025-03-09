import Foundation
import UIKit

func saveImageToDocumentsDirectory(url: String, onComplete: @escaping (String?, String?) -> Void, onConvert: @escaping (String?, String?) -> Void) {
    // get filename from url, or a random uuid
    var imageFileName = url.components(separatedBy: "/").last ?? UUID().uuidString

    let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    var destinationURL = documentsDirectory.appendingPathComponent("images").appendingPathComponent(imageFileName)

    // check if current file exists. if it does check if it ends in _1, _2, etc. if it does, increment the number and save it as that. if it doesn't, save it as _1
    if FileManager.default.fileExists(atPath: destinationURL.path) {
        let fileExtension = destinationURL.pathExtension
        let fileName = destinationURL.deletingPathExtension().lastPathComponent
        var fileNumber = 1
        var newFileName = fileName + "_\(fileNumber)"
        var newDestinationURL = destinationURL.deletingLastPathComponent().appendingPathComponent(newFileName).appendingPathExtension(fileExtension)
        while FileManager.default.fileExists(atPath: newDestinationURL.path) {
            fileNumber += 1
            newFileName = fileName + "_\(fileNumber)"
            newDestinationURL = destinationURL.deletingLastPathComponent().appendingPathComponent(newFileName).appendingPathExtension(fileExtension)
        }
        destinationURL = newDestinationURL
        imageFileName = newFileName
    }
    
    let session = URLSession(configuration: .default)
    let downloadUrl = URL(string: url)!
    let downloadTask = session.downloadTask(with: downloadUrl) { (location, _, error) in
        if let error = error {
            print("Error: \(error.localizedDescription)")
            onComplete(nil, error.localizedDescription)
            return
        }
        
        guard let location = location else {
            print("Error: location is nil")
            onComplete(nil, "Error: location is nil")
            return
        }
        
        do {
            try FileManager.default.createDirectory(at: destinationURL.deletingLastPathComponent(), withIntermediateDirectories: true, attributes: nil)
            try FileManager.default.moveItem(at: location, to: destinationURL)
            print("Image saved successfully at: \(destinationURL.path)")
            onComplete(destinationURL.path, nil)


            sleep(2)
            let image = UIImage(contentsOfFile: destinationURL.path)!
            func heic(compressionQuality: CGFloat = 1, image: UIImage) -> Data? {
                guard
                    let mutableData = CFDataCreateMutable(nil, 0),
                    let destination = CGImageDestinationCreateWithData(mutableData, "public.heic" as CFString, 1, nil),
                    let cgImage = image.cgImage
                else { return nil }
                CGImageDestinationAddImage(destination, cgImage, [kCGImageDestinationLossyCompressionQuality: compressionQuality] as CFDictionary)
                guard CGImageDestinationFinalize(destination) else { return nil }
                return mutableData as Data
            }

            let heicData = heic(compressionQuality: 1.0, image: image)
            let heicDestinationURL = destinationURL.deletingPathExtension().appendingPathExtension("heic")
            try heicData!.write(to: heicDestinationURL)
            print("Image saved successfully at: \(heicDestinationURL.path)")

            onConvert(heicDestinationURL.path, nil)

            // now delete the original image
            try FileManager.default.removeItem(at: destinationURL)

        } catch {
            print("Error: \(error.localizedDescription)")
            onComplete(nil, error.localizedDescription)
        }
    }
    
    downloadTask.resume()
}


func getImagesFromDirectory() -> [String] {
    let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    let imagesDirectory = documentsDirectory.appendingPathComponent("images")

    do {
        // let fileURLs = try FileManager.default.contentsOfDirectory(at: imagesDirectory, includingPropertiesForKeys: nil)
        // let imagePaths = fileURLs.map { $0.path }
        // sort by created
        let fileURLs = try FileManager.default.contentsOfDirectory(at: imagesDirectory, includingPropertiesForKeys: [.creationDateKey], options: .skipsHiddenFiles)
        let imagePaths = fileURLs.sorted(by: { (url1: URL, url2: URL) -> Bool in
            let date1 = try! url1.resourceValues(forKeys: [.creationDateKey]).creationDate!
            let date2 = try! url2.resourceValues(forKeys: [.creationDateKey]).creationDate!
            return date1 > date2
        }).map { $0.path }
        


        return imagePaths
    } catch {
        print("Error: \(error.localizedDescription)")
        return []
    }
}
