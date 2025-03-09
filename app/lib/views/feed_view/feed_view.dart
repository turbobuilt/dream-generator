import 'dart:math';
import 'package:dev/helpers/better_state.dart';
import 'package:dev/main.dart';
import 'package:dev/views/share_card/share_card_view.dart';
import 'package:dev/widgets/DoubleScroll.dart';
import 'package:flutter/cupertino.dart' hide ListView;
import 'package:flutter/material.dart' hide ListView;
import 'package:flutter/rendering.dart' show ScrollDirection;
import 'package:provider/provider.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../../helpers/network_helper.dart';
import '../../widgets/ListView.dart' show ListView;
import '../create_image_view/components/create_image_view_data/create_image_view_data.dart';
import '../create_image_view/create_image_view.dart';
import '../display_all_images_view.dart';
import '../main_view/main_view.dart';
import '../share_card/components/share_card_view_data.dart';

class FeedViewData extends ChangeNotifier {
  BuildContext? context;
  var scrollController = ScrollController();
  var refreshController = RefreshController(initialRefresh: false);
  var loading = false;
  var error = "";
  var atStart = false;
  var lastLoad = DateTime.now();
  var specialLoading = true;
  var atEnd = false;
  var showLoadMore = false;
  var forceShowFeed = false;
  Future? loadStart;
  Future? loadEnd;
  List<dynamic>? items;

  reset() {
    scrollController = ScrollController();
    refreshController = RefreshController(initialRefresh: false);
    loading = false;
    error = "";
    atStart = false;
    lastLoad = DateTime.now();
    specialLoading = true;
    atEnd = false;
    showLoadMore = false;
    forceShowFeed = false;
    loadStart = null;
    loadEnd = null;
    items = null;
    update();
  }

  FeedViewData() {
    print("DOING FEED VIEW");
    loadImages();
    refreshCalled();
    scrollController.addListener(() {
      if (loading) {
        return;
      }
      // at miminum 2 seconds
      final now = DateTime.now();
      var debounce = false;
      if (now.difference(lastLoad).inSeconds < 2) {
        debounce = true;
      }
      if ((scrollController.position.pixels > scrollController.position.maxScrollExtent - 300 && !atEnd) ||
          (scrollController.position.pixels > scrollController.position.maxScrollExtent + 5)) {
        if (debounce) {
          if (loadStart != null) {
            return;
          }
          // set loadStart to load at end of remaining time
          loadStart = Future.delayed(Duration(seconds: 2 - now.difference(lastLoad).inSeconds), () {
            loadStart = null;
            getResults();
          });
        } else {
          getResults();
        }
        getResults();
      } else if (scrollController.position.pixels < scrollController.position.minScrollExtent + 300) {
        if (debounce) {
          if (loadEnd != null) {
            return;
          }
          // set loadStart to load at end of remaining time
          loadEnd = Future.delayed(Duration(seconds: 2 - now.difference(lastLoad).inSeconds), () {
            loadEnd = null;
            getResults(direction: ScrollDirection.reverse);
          });
        } else {
          getResults(direction: ScrollDirection.reverse);
        }
      }
    });
  }

  loadImages() async {
    if (globalDisplayAllImagesViewStore.imagePaths.isEmpty) {
      await globalDisplayAllImagesViewStore.loadImagePaths();
    }
    notifyListeners();
  }

  showError(String? e) {
    final toast = SnackBar(content: Text(e ?? "Error"));
    if (context == null || context?.mounted == false) {
      return;
    }
    ScaffoldMessenger.of(context!).showSnackBar(toast);
  }

  refreshCalled() {
    print("Getting items");
    if (items == null) {
      getResults();
    } else {
      getResults(direction: ScrollDirection.reverse);
    }
  }

  getResults({ScrollDirection direction = ScrollDirection.forward, clear = false}) async {
    if (loading) {
      specialLoading = false;
      notifyListeners();
      return;
    }
    if (atStart && direction == ScrollDirection.reverse) {
      specialLoading = false;
      notifyListeners();
      return;
    }
    loading = true;
    notifyListeners();
    // waiit 3 seconds
    // await Future.delayed(const Duration(milliseconds: 3000));
    print("still getting items");
    var url = "/api/feed";
    if (direction == ScrollDirection.reverse) {
      url += "?direction=reverse";
      if (items != null && items!.isNotEmpty) {
        url += "&first=${items![0]["position"]}";
      }
    } else {
      url += "?direction=forward"; // ${items == null ? '&isFirstLoad=true' : ''}
      if (items == null || clear) {
        url += '&isFirstLoad=true';
      }
    }
    print("url is $url");

    // include frist item 'created' if possible
    final response = await getRequest(url);
    specialLoading = false;
    lastLoad = DateTime.now();
    if (response.error != "" && response.error != null) {
      showError(response.error);
      refreshController.refreshFailed();
      refreshController.loadFailed();
      loading = false;
      notifyListeners();
      return;
    }
    if (clear) {
      items = [];
    }
    items ??= [];
    if (response.result["items"].length > 0) {
      if (direction == ScrollDirection.reverse) {
        if (items?.isNotEmpty == true) {
          // add property addAtFront to all new items
          for (var i = 0; i < response.result["items"].length; ++i) {
            response.result["items"][i]["addAtFront"] = true;
          }
        } else {
          // add property addAtFront to all new items
          for (var i = 0; i < response.result["items"].length; ++i) {
            response.result["items"][i]["isFirstLoad"] = false;
          }
        }
        items!.insertAll(0, response.result["items"]);
      } else {
        items!.addAll(response.result["items"]);
        if (items!.length > 4) {}
      }
    } else {
      if (direction == ScrollDirection.reverse) {
        atStart = true;
      } else {
        atEnd = true;
      }
    }
    loading = false;
    notifyListeners();
    if (showLoadMore == false) {
      // run next tick
      await Future.delayed(Duration.zero);
      showLoadMore = true;
      notifyListeners();
    }
  }

  update() {
    notifyListeners();
  }
}

var feedView = FeedViewData();

class FeedView extends StatefulWidget {
  @override
  FeedViewState createState() => FeedViewState();
}

final createImageViewFeed = CreateImageViewData();

class FeedViewState extends BetterState<FeedView> {
  var feedViewData = feedView;
  final states = <int, ShareCardViewData>{};

  FeedViewState() {
    // reload if it's been longer than 5 minutes
    if (feedView.items == null || feedView.items!.isEmpty || DateTime.now().difference(feedView.lastLoad).inSeconds > 1) {
      feedView.specialLoading = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    feedView.context = context;

    return ChangeNotifierProvider.value(
      value: feedView,
      child: Consumer<FeedViewData>(
        builder: (context, notifier, child) => !globalDisplayAllImagesViewStore.imagesLoaded
            ? Container()
            : Column(
                children: [
                  if (globalDisplayAllImagesViewStore.imagePaths.isNotEmpty || feedView.forceShowFeed || true)
                    Expanded(
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: ListView.builder(
                              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                              atEnd: feedView.atEnd,
                              atStart: feedView.atStart,
                              noMoreAtEndText: "No more 😄. Pull up to refresh!",
                              noMoreAtStartText: "No more 😄",
                              loadingStart: feedView.loading,
                              loadingEnd: feedView.loading,
                              addSemanticIndexes: false,
                              showLoadMore: feedView.showLoadMore,
                              items: feedView.items,
                              controller: feedViewData.scrollController,
                              cacheExtent: MediaQuery.of(context).size.height * 10,
                              itemCount: feedView.items?.length ?? 0,
                              itemBuilder: (context, index) {
                                final id = feedView.items![index]["id"];
                                if (!states.containsKey(id)) {
                                  states[id] = ShareCardViewData();
                                  states[id]!.share = feedView.items![index];
                                }
                                final view = ShareCardView(states[id]!);
                                return view;
                              },
                            ),
                          ),
                          Positioned.fill(
                            child: ChangeNotifierProvider.value(
                              value: tapOutsideOverlayState,
                              child: Consumer<TapOutsideOverlayState>(
                                builder: (context, tapOutsideOverlayState, child) {
                                  if (tapOutsideOverlayState.showing) {
                                    return SizedBox(
                                      child: GestureDetector(
                                        child: Container(color: Colors.transparent),
                                        onTap: () {
                                          print("tapped outside");
                                          tapOutsideOverlayState.hide();
                                        },
                                      ),
                                    );
                                  } else {
                                    return const SizedBox(height: 0);
                                  }
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    const Spacer(),
                  CreateImageView(false, createImageViewFeed, expand: globalDisplayAllImagesViewStore.imagePaths.isEmpty),
                ],
              ),
      ),
    );
  }
}
