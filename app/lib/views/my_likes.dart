import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/models/Prompt.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_avif/flutter_avif.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../helpers/network_helper.dart';

var myLikesState = MyLikesViewState();

class MyLikesView extends StatefulWidget {
  @override
  // ignore: no_logic_in_create_state
  MyLikesViewState createState() {
    myLikesState = MyLikesViewState();
    return myLikesState;
  }
}

class MyLikesViewState extends BetterState<MyLikesView> {
  ScrollController scrollController = ScrollController();
  List<dynamic>? items;
  var error = "";
  var loading = true;
  var doneScrolling = false;
  var page = 1;
  var perPage = 2;
  var isFirstLoad = true;
  var orderBy = "created";
  var sortDirection = -1;
  var refreshController = RefreshController();

  MyLikesViewState() {
    getMyLikes();
    // scrollController.addListener(() {
    //   if (!doneScrolling && !loading && scrollController.position.pixels > scrollController.position.maxScrollExtent - 100) {
    //     getMyLikes();
    //   }
    // });
  }

  refreshLikes() {
    page = 1;
    doneScrolling = false;
    items = null;
    isFirstLoad = true;
    getMyLikes();
  }

  getMyLikes() async {
    if (loading && !isFirstLoad) {
      print("cancelling");
      return;
    }
    isFirstLoad = false;
    loading = true;
    print("lodign likes");
    final response = await getRequest("/api/my-shares?page=$page&perPage=$perPage");
    print("loaded likes");
    print(response.result);
    if (response.error != null) {
      update(() {
        error = response.error ?? "error";
        loading = false;
      });
      refreshController.refreshCompleted();
      refreshController.loadComplete();
      return;
    }
    final results = response.result["items"];
    update(() {
      page += 1;
      items ??= [];
      if (results.isEmpty) {
        doneScrolling = true;
        refreshController.loadNoData();
      }
      items!.addAll(results);
      loading = false;
      print("Set state");
      refreshController.refreshCompleted();
      refreshController.loadComplete();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(0, 8, 0, 8),
              // background gradient left to right blue to purple
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.blue, Colors.purple],
                ),
              ),
              child: const Center(child: Text("Published Images", style: TextStyle(fontSize: 20, color: Colors.white)))),
          if (items != null && items!.isNotEmpty) ...{
            Expanded(
              child: SmartRefresher(
                enablePullDown: true,
                enablePullUp: true,
                header: const WaterDropHeader(),
                controller: refreshController,
                onLoading: getMyLikes,
                onRefresh: refreshLikes,
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
                      child: Center(child: body),
                    );
                  },
                ),
                child: Padding(
                  padding: const EdgeInsets.all(5.0),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    padding: const EdgeInsets.all(0),
                    // controller: scrollController,
                    itemCount: items?.length ?? 0,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 5,
                      mainAxisSpacing: 5,
                    ),
                    itemBuilder: (context, index) {
                      final prompt = items![index];
                      return InkWell(
                        onTap: () {
                          // Navigator.pushNamed(context, "/view-prompt", arguments: prompt);
                          routeData = prompt;
                          router.push("/share-details/${prompt["id"]}");
                        },
                        // child: Text("Hello"),
                        child: prompt["path"]?.isNotEmpty == true
                            ? AvifImage.network(
                                "https://images.dreamgenerator.ai/${prompt["path"]}",
                                errorBuilder: (BuildContext context, Object exception, StackTrace? stackTrace) {
                                  return const Center(child: Text('😢'));
                                },
                                frameBuilder: (BuildContext context, Widget child, int? frame, bool wasSynchronouslyLoaded) {
                                  if (wasSynchronouslyLoaded) {
                                    return child;
                                  }
                                  return AnimatedOpacity(
                                    opacity: frame == null ? 0 : 1,
                                    duration: const Duration(seconds: 1),
                                    curve: Curves.easeOut,
                                    child: child,
                                  );
                                },
                                loadingBuilder: (BuildContext context, Widget child, ImageChunkEvent? loadingProgress) {
                                  if (loadingProgress == null) {
                                    return child;
                                  }
                                  return const CupertinoActivityIndicator();
                                },
                              )
                            : const Text("Image failed to upload"),
                      );
                    },
                  ),
                ),
              ),
              // ],
            )
          } else if (items != null && items!.isEmpty) ...{
            const Padding(
              padding: EdgeInsets.all(15),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: 20),
                  Center(child: Text("Publish your first prompt and see if anybody likes it!", style: TextStyle(fontSize: 16))),
                  SizedBox(height: 21),
                  Center(
                      child: Text("To get started, click on an image you have generated, click the Publish sign, and see who likes it!",
                          style: TextStyle(fontSize: 15))),
                  SizedBox(height: 21),
                  Center(child: Icon(Icons.favorite, size: 50, color: Colors.blue)),
                  SizedBox(height: 20),
                ],
              ),
            ),
          } else ...{
            Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 40),
                  const Center(child: Text("Loading...", style: TextStyle(fontSize: 20))),
                  const SizedBox(height: 21),
                  const Center(child: CircularProgressIndicator()),
                  const SizedBox(height: 20),
                  if (error.isNotEmpty) Text(error, style: const TextStyle(color: Colors.red)),
                ],
              ),
            ),
          }
        ],
      ),
    );
  }
}
