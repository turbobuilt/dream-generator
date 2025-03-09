import SwiftUI


class ErrorToastData: NSObject, ObservableObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    var error = "error test"
}

let globalErrorToastData = ErrorToastData()

struct ErrorToast: View {
    @StateObject var errorToastData = globalErrorToastData
    var body: some View {
        Text(errorToastData.error)
            .padding(20)
            .font(.body)
            .multilineTextAlignment(.center)
            .background(Color(red: 0.91, green: 0.91, blue: 0.91))
            .cornerRadius(20)
            .padding(20)
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                    errorToastData.error = ""
                }
            }
    }
}

struct ErrorToast_Previews: PreviewProvider {
    static var previews: some View {
        ErrorToast()
    }
}
