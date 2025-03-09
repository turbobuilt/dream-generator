import UIKit
import SwiftUI
import WebRTC

class VideoCallViewController: UIViewController {
    static var shared = VideoCallViewController()
    
    var localVideoView: RTCMTLVideoView!
    var remoteVideoView: RTCMTLVideoView!

    override func viewDidLoad() {
        super.viewDidLoad()
        let videoCallView = VideoCallView()
        let hostingController = UIHostingController(rootView: videoCallView)
        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.view.frame = view.bounds
        hostingController.didMove(toParent: self)
    }
}
