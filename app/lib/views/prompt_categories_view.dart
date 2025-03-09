import 'dart:io';

import 'package:dev/helpers/datastore.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dio/dio.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../helpers/network_helper.dart';
import '../models/PromptCategory.dart';

final promptCategories = PromptCategoriesViewState();

class PromptCategoriesViewState extends ChangeNotifier {
  // scroll controller
  ScrollController scrollController = ScrollController();
  List<dynamic>? categories;
  var error = "";
  var loading = false;
  Map<int, bool> hasVideo = {};
  Directory? supportDirectory;
  var refreshController = RefreshController();
  Map<int, VideoPlayerController> videoControllers = {};

  PromptCategoriesViewState() {
    getApplicationDocumentsDirectory().then((value) {
      supportDirectory = value;
    });
    // scrollController.addListener(() {
    //   // if pull down far enough
    //   if (!loading && scrollController.position.pixels > scrollController.position.maxScrollExtent - 100) {
    //     getPromptCategories();
    //   }
    // });
  }

  getCategoryVideoPath(id) {
    return "${promptCategories.supportDirectory?.path}/category-videos/preview/$id.mp4";
  }

  getPromptCategories() async {
    loading = true;
    categories = [];
    notifyListeners();
    final response = await getRequest("/api/prompt-categories");
    loading = false;
    if (response.error != null) {
      error = response.error ?? "error";
      notifyListeners();
      return;
    }

    categories = (response.result["items"] as List<dynamic>).map((val) {
      final item = PromptCategory();
      item.fromMap(val);
      item.name = val["name"].toString().split(" ").map((word) {
        return word[0].toUpperCase() + word.substring(1);
      }).join(" ");
      return item;
    }).toList();
    notifyListeners();
    refreshController.refreshCompleted();
    refreshController.loadComplete();
    await playLocalVideos();
    await fetchVideos();
    notifyListeners();
  }

  playLocalVideos() async {
    final db = await getDb();
    final box = await db.openBox("promptCategoryVideos");
    for (var category in categories!) {
      final cachedEtag = await box.get(category.id.toString());
      if (cachedEtag != null) {
        if (videoControllers[category.id] != null) {
          await videoControllers[category.id]!.dispose();
        }
        hasVideo[category.id] = true;
        videoControllers[category.id] = VideoPlayerController.file(File(promptCategories.getCategoryVideoPath(category.id)));
        videoControllers[category.id]!.initialize().then((_) {
          videoControllers[category.id]!.setLooping(true);
          videoControllers[category.id]!.play();
          print("initialized video controller for ${category.id}");
          notifyListeners();
        });
      }
    }
  }

  fetchVideos() async {
    // for each category, check if it has a video
    final db = await getDb();
    final box = await db.openBox("promptCategoryVideos");
    final dataDir = await getApplicationSupportDirectory();
    // create directory if it doesn't exist

    for (var category in categories!) {
      // head request to https://dreamgenerator.ai/share/prompt-category/${id}/preview.mp4
      final infoResult = await headRequest("https://dreamgenerator.ai/share/prompt-category/${category.id}/preview.mp4");
      if (infoResult.error != null) {
        print("error getting head metadata for category ${category?.id}");
        print(infoResult.error);
        continue;
      }
      // if no etag, it doesn't exist
      if (infoResult.result["etag"] == null) {
        print("no etag for ${category.id}");
        continue;
      }
      final cachedEtag = await box.get(category.id.toString());
      print("cached etag is $cachedEtag, current etag is ${infoResult.result["etag"]}");
      var newVideo = false;
      if (cachedEtag == null || cachedEtag != infoResult.result["etag"]) {
        // download video
        newVideo = true;
        try {
          final response = await dio.get(
              "https://dreamgenerator.ai/share/prompt-category/${category.id}/preview.mp4?cachebust=${DateTime.now().millisecondsSinceEpoch}",
              options: Options(responseType: ResponseType.bytes));

          if (response.statusCode.toString().startsWith("2")) {
            // save video to category-videos/preview/${id}.mp4
            final file = File(promptCategories.getCategoryVideoPath(category.id));
            print("Saving to ${file.path}");
            // delete if exists
            if (await file.exists()) {
              await file.delete();
            }
            await file.create(recursive: true);
            await file.writeAsBytes(response.data);
            // save etag to box
            await box.put(category.id.toString(), infoResult.result["etag"]);
            // set hasVideo to true
            hasVideo[category.id] = true;
          } else {
            print("error downloading video for category ${category?.id}");
            print(response.data);
          }
        } catch (err) {
          print("error downloading video for category ${category?.id}");
          print(err);
        }
        // ignore: dead_code
      } else {
        hasVideo[category.id] = true;
      }
      if (hasVideo[category.id] == true && newVideo) {
        if (videoControllers[category.id] != null) {
          await videoControllers[category.id]!.dispose();
        }
        videoControllers[category.id] = VideoPlayerController.file(File(promptCategories.getCategoryVideoPath(category.id)));
        videoControllers[category.id]!.initialize().then((_) {
          videoControllers[category.id]!.setLooping(true);
          videoControllers[category.id]!.play();
          print("initialized video controller for ${category.id}");
          notifyListeners();
        });
      }
    }
  }
}

class PromptCategoriesView extends StatelessWidget {
  double titleHeight = 40;

  @override
  Widget build(BuildContext context) {
    var boxHeight = MediaQuery.of(context).size.width * .8 + titleHeight + 16;
    var boxWidth = MediaQuery.of(context).size.width * .8;
    if (promptCategories.categories == null) {
      promptCategories.getPromptCategories();
    }
    return ChangeNotifierProvider.value(
      value: promptCategories,
      child: Consumer<PromptCategoriesViewState>(
        builder: (context, notifier, child) => promptCategories.categories != null
            ? Container(
                // max height 50% vh
                constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6, maxWidth: MediaQuery.of(context).size.width),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Container with gradient from blue to purple left to right
                    Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Colors.blue, Colors.purple],
                        ),
                        //box shadow
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(1),
                            spreadRadius: 0,
                            blurRadius: 2,
                            offset: const Offset(0, 0), // changes position of shadow
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.fromLTRB(0, 14, 0, 14),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Fresh Ideas!",
                            style: TextStyle(fontSize: 20, color: Colors.white),
                          )
                        ],
                      ),
                    ),
                    // Text("Prompt Categories", style: TextStyle(fontSize: 20)),
                    SizedBox(
                      height: boxHeight,
                      child: SmartRefresher(
                        enablePullDown: true,
                        scrollDirection: Axis.horizontal,
                        header: ClassicHeader(
                          refreshingText: "",
                          releaseText: "",
                          completeText: "",
                          idleText: "",
                          failedText: "",
                          // right arrow icon
                          idleIcon: const Icon(Icons.arrow_forward, color: Colors.grey),
                          iconPos: IconPosition.top,
                          outerBuilder: (child) {
                            return SizedBox(
                              width: 80.0,
                              child: Center(
                                child: child,
                              ),
                            );
                          },
                        ),
                        controller: promptCategories.refreshController,
                        onLoading: promptCategories.getPromptCategories,
                        onRefresh: promptCategories.getPromptCategories,
                        footer: CustomFooter(
                          builder: (BuildContext context, LoadStatus? mode) {
                            Widget body;
                            if (mode == LoadStatus.idle) {
                              body = const Text("pull up load");
                            } else if (mode == LoadStatus.loading) {
                              body = const CupertinoActivityIndicator();
                            } else if (mode == LoadStatus.failed) {
                              body = const Text("Load Failed! Click retry!");
                            } else if (mode == LoadStatus.canLoading) {
                              body = const Text("release to load more");
                            } else {
                              body = const Text("No more Data");
                            }
                            return SizedBox(
                              height: 55.0,
                              width: 200,
                              child: Center(child: body),
                            );
                          },
                        ),
                        child: ListView(
                          shrinkWrap: true,
                          scrollDirection: Axis.horizontal,
                          // padding 0

                          // controller: promptCategories.scrollController,
                          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                          padding: const EdgeInsets.all(0),
                          children: promptCategories.categories!.map((category) {
                            return SizedBox(
                              width: boxWidth,
                              height: boxHeight,
                              child: Padding(
                                padding: const EdgeInsets.fromLTRB(8, 8, 0, 8),
                                child: Card(
                                  elevation: 4,
                                  child: GestureDetector(
                                    onTap: () => router.push("/prompt-category/${category.id}"),
                                    child: LayoutBuilder(builder: (context, cardConstraints) {
                                      return Column(
                                        crossAxisAlignment: CrossAxisAlignment.stretch,
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          SizedBox(
                                            height: cardConstraints.maxHeight - titleHeight,
                                            width: cardConstraints.maxWidth,
                                            child: promptCategories.hasVideo[category.id] == true
                                                ? VideoPlayer(promptCategories.videoControllers[category.id]!)
                                                : Container(
                                                    padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                                                    color: const Color.fromARGB(255, 235, 235, 235),
                                                    child: const Icon(Icons.image, color: Color.fromARGB(255, 79, 79, 79)),
                                                  ),
                                          ),
                                          Container(
                                            decoration: const BoxDecoration(
                                              color: Colors.white,
                                              border: Border(top: BorderSide(color: Colors.blue, width: 2)),
                                            ),
                                            height: titleHeight,

                                            // padding: EdgeInsets.all(8),
                                            child: Center(
                                              child: Text(
                                                category.name,
                                                textAlign: TextAlign.center,
                                                style: const TextStyle(fontSize: 18, overflow: TextOverflow.ellipsis),
                                              ),
                                            ),
                                          ),
                                        ],
                                      );
                                    }),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : ListView(
                padding: const EdgeInsets.all(8.0),
                shrinkWrap: true,
                children: [
                  const SizedBox(height: 20),
                  Column(children: [
                    if (promptCategories.error.isEmpty) ...{
                      const Text("Loading Social Feed", style: TextStyle(fontSize: 20)),
                      const SizedBox(height: 30),
                      // loading spinner
                      const CircularProgressIndicator(),
                      const SizedBox(height: 20),
                    } else ...{
                      Text(promptCategories.error, style: const TextStyle(fontSize: 20, color: Colors.red)),
                      const SizedBox(height: 30),
                    }
                  ]),
                ],
              ),
      ),
    );
  }
}
