import 'package:dev/helpers/better_state.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/models/Prompt.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../helpers/network_helper.dart';

class PromptCategoryView extends StatefulWidget {
  late int categoryId;
  PromptCategoryView(String? id) {
    categoryId = int.parse(id ?? "0");
  }

  @override
  PromptCategoryViewState createState() => PromptCategoryViewState(categoryId);
}

class PromptCategoryViewState extends BetterState<PromptCategoryView> {
  List<dynamic>? prompts;
  var error = "";
  late int id;
  var loading = true;
  ScrollController scrollController = ScrollController();
  var doneScrolling = false;
  var page = 1;
  var perPage = 2;
  var isFirstLoad = true;
  var refreshController = RefreshController();

  PromptCategoryViewState(this.id) {
    getPrompts();
    // scrollController.addListener(() {
    //   if (!loading && scrollController.position.pixels > scrollController.position.maxScrollExtent - 100) {
    //     getPrompts();
    //   }
    // });
  }

  refreshPrompts() {
    page = 1;
    doneScrolling = false;
    prompts = null;
    isFirstLoad = true;
    getPrompts();
  }

  getPrompts() async {
    if (loading && !isFirstLoad) {
      return;
    }
    isFirstLoad = false;
    loading = true;
    final response = await getRequest("/api/prompt?category=$id&page=$page&perPage=$perPage");

    if (response.error != null) {
      update(() {
        error = response.error ?? "error";
        loading = false;
      });
      refreshController.refreshCompleted();
      refreshController.loadComplete();
      return;
    }
    update(() {
      page += 1;
      prompts ??= [];

      final items = (response.result["items"] as List<dynamic>).map((val) {
        final item = Prompt();
        item.fromMap(val);
        return item;
      }).toList();
      prompts!.addAll(items);
      loading = false;
      refreshController.refreshCompleted();
      refreshController.loadComplete();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox(
        height: MediaQuery.of(context).size.height,
        child: Column(children: [
          Container(
              // background gradient left to right blue to purple
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.blue, Colors.purple],
                ),
              ),
              child: AppBar(title: const Text("Ideas"))),
          if (prompts != null) ...{
            Expanded(
              child: SmartRefresher(
                enablePullDown: true,
                enablePullUp: true,
                header: const WaterDropHeader(),
                controller: refreshController,
                onLoading: getPrompts,
                onRefresh: refreshPrompts,
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
                child: ListView(
                  // shrinkWrap: true,
                  physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                  padding: const EdgeInsets.all(0),
                  // controller: scrollController,
                  children: prompts!.map((prompt) {
                    return Container(
                      // border bottom 1px solid gray
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Colors.grey)),
                      ),
                      padding: const EdgeInsets.all(7.0),
                      child: GestureDetector(
                        onTap: () => router.push("/prompt/${prompt.id}"),
                        // overflow ellipsis
                        child: Row(children: [
                          Expanded(child: Text(prompt.title, overflow: TextOverflow.ellipsis)),
                          const SizedBox(width: 20),
                          if (prompt.likesCount > 0) ...{
                            Text("+ ${prompt.likesCount}"),
                          }
                        ]),
                      ),
                    );
                  }).toList(),
                ),
              ),
              // ],
            )
          } else ...{
            const SizedBox(height: 40),
            const Center(child: Text("Loading...", style: TextStyle(fontSize: 20))),
            const SizedBox(height: 21),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            if (error.isNotEmpty) Text(error, style: const TextStyle(color: Colors.red)),
          }
        ]),
      ),
    );
  }
}
