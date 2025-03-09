import 'package:dev/lib/call_method.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/lib/smart_widget.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_compress/video_compress.dart';

class AnimateVideoState extends BetterChangeNotifier {
  String? videoPath;
  double uploadProgress = 0;

  Future<XFile?> pickVideo() async {
    final ImagePicker picker = ImagePicker();
    return await picker.pickVideo(source: ImageSource.gallery);
  }

  Future<MediaInfo?> compressVideo(String path) async {
    await VideoCompress.setLogLevel(0);
    return await VideoCompress.compressVideo(
      path,
      quality: VideoQuality.HighestQuality,
      frameRate: 3,
    );
  }

  Future<void> pickAndUploadVideo() async {
    XFile? video = await pickVideo();
    if (video != null) {
      MediaInfo? videoInfo = await VideoCompress.getMediaInfo(video.path);
      var result = await callMethod("getAnimateVideoUploadLink", [
        {
          "fileSize": videoInfo.filesize,
          "duration": videoInfo.duration,
        }
      ]);
      notifyListeners();
      if (showHttpErrorIfExists(result)) {
        return;
      }

      var dio = Dio();
      print(" result is $result");

      // include on progress
      Response response;
      try {
        response = await dio.put(
          result["uploadUrl"],
          data: await video.readAsBytes(),
          onSendProgress: (int sent, int total) {
            uploadProgress = sent / total;
            notifyListeners();
          },
          options: Options(
            contentType: 'video/mp4',
            headers: {
              'Content-Type': 'video/mp4',
            },
          ),
        );
        print(response);
      } catch (e) {
        // print response data if available
        if (e is DioException) {
          print(e.response?.data);
        }
        print('Error uploading video: $e');
      }
    }
  }
}

var animateVideoState = AnimateVideoState();
