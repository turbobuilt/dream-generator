import 'package:dev/helpers/better_state.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';

// create a stateful widget called DoubleScroll.  It uses a ScrollView and a Viewport to render items in a list.  The list items may change.  So on each rerender it has to check a map called 'itemsInfo'. This map contains a mapping of each item in the list to an object that has a property called 'height'.  So what happens is when a rerender is called is it goes ahead and looks at each item in the list and checks if it has appeared in the 'itemsInfo' map.  If it hasn't appeareared it has been added to the list.  But it could be added to the front or back of the list so we have to keep track of that.  Well, come up with an algorithm to detect.  Then we have to render the items in the Viewport.  When items are added at the front they should be rendered if they are within 500px of visibility.  If items are removed from the front of the list, then we have to update the position of the ScrollView.  To detect if items are removed, while doing the map, we have to keep track of which ones are found.  Then we have to go through the map and see which ones haven't been found.  If they are before we need to reduce the ScrollView scroll position by the amount of the 'widgetHeight' property on itemsInfo.  This should be 0 until it is first rendered.

class DoubleScroll extends StatefulWidget {
  final Widget Function(BuildContext context, int index) builder;
  final List<dynamic> children;
  Function? loadMoreStart;
  Function? loadMoreEnd;

  DoubleScroll({required this.builder, required this.children, this.loadMoreStart, this.loadMoreEnd});

  @override
  DoubleScrollState createState() => DoubleScrollState();
}

class Info {
  double height = 0.0;
}

class DoubleScrollState extends BetterState<DoubleScroll> {
  final ScrollController _scrollController = ScrollController();
  final ViewportOffset _viewportOffset = ViewportOffset.zero();
  final Map<dynamic, Info> itemsInfo = {};
  dynamic currentItem;
  double scrollPosition = 0.0;
  var loadingStart = false;
  var loadingEnd = false;
  var lastLoad = DateTime.now();
  // var hasScrolledDown = false;
  var startLoadedAll = true;
  var loading = false;
  List<dynamic> _children = [];

  // enum scrollDirection
  AxisDirection scrollDirection = AxisDirection.down;

  DoubleScrollState() {
    _scrollController.addListener(() {
      // if 250 px from bottom of list, load more
            if (_scrollController.position.pixels > _scrollController.position.maxScrollExtent - 250 && !loadingEnd) {
        print("HIT END");
        if (widget.loadMoreEnd != null && DateTime.now().difference(lastLoad).inSeconds > 1) {
          // hasScrolledDown = true;
          if (scrollDirection == AxisDirection.down) {
            loadMoreEnd();
          } else {
            loadMoreStart();
          }
        }
      } // if 250 px from top of list, load more
      else if (_scrollController.position.pixels < 250 && !loadingStart && !startLoadedAll) {
        print("HIT START");
        if (widget.loadMoreStart != null && DateTime.now().difference(lastLoad).inSeconds > 1) {
          if (scrollDirection == AxisDirection.down) {
            loadMoreStart();
          } else {
            loadMoreEnd();
          }
        }
      }
    });
  }

  loadMoreEnd() async {
    print("LOADING MORE END");
    lastLoad = DateTime.now();
    loadingEnd = true;
    try {
      await widget.loadMoreEnd!();
      recalculate();
    } catch (e) {
      print("error loading more end");
      print(e);
    }
    // scrollDirection = AxisDirection.reverse;
    // loadingEnd = false;
  }

  loadMoreStart() async {
    lastLoad = DateTime.now();
    loadingStart = true;
    try {
      await widget.loadMoreStart!();
      recalculate();
    } catch (e) {
      print("error loading more start");
      print(e);
    }
    // scrollDirection = AxisDirection.forward;
    // loadingStart = false;
  }

  var recalculating = false;
  recalculate() async {
    if (recalculating) return;
    recalculating = true;
    // compute items that have been added and removed
    var isAtStart = _children.isNotEmpty;
    var toInsertAtStart = [], toInsertAtEnd = [];
    var currentMap = {};
    for (int i = 0; i < widget.children.length; ++i) {
      final item = widget.children[i];
      currentMap[item] = true;
      var itemInfo = itemsInfo[item];
      if (itemInfo == null) {
        itemInfo = Info();
        itemsInfo[item] = itemInfo;
        // item has been added
        itemsInfo[item] = Info();
        if (isAtStart) {
          toInsertAtStart.add(item);
        } else {
          toInsertAtEnd.add(item);
        }
      } else {
        isAtStart = false;
      }
    }

    if (toInsertAtEnd.isNotEmpty) {
      print("ADDING AT END");
    }
    for (var item in toInsertAtEnd) {
      _children.add(item);
    }

    // now find items that have been removed. Make sure to note before or after
    var currentItemIndex = _children.indexOf(currentItem);
    final toRemove = [];
    for (var key in itemsInfo.keys) {
      if (currentMap[key] == null) {
        // item has been removed
        final index = _children.indexOf(key);
        if (index < currentItemIndex) {
          // item has been removed before
          // scrollPosition -= itemsInfo[key]!.height;
          // _scrollController.jumpTo(scrollPosition);
        }
        toRemove.add(key);
      }
    }
    // ListView.builder(itemBuilder: itemBuilder)
    if (toRemove.isNotEmpty) {
      print("REMOVING");
      _children.removeWhere((element) => toRemove.contains(element));
      scrollDirection = AxisDirection.up;
      // _children = _children.reversed.toList();
      scrollPosition = _scrollController.position.maxScrollExtent - scrollPosition;
      // _scrollController.position.

      for (var key in toRemove) {
        itemsInfo.remove(key);
      }
    }

    // ListView.custom

    testWidgets("My test", (WidgetTester tester) async {
      final myContainer = Container(
        height: 1000,
        color: Colors.teal,
      );
      final result = await tester.pumpWidget(myContainer);
      // get size
      final size = tester.getSize(find.byWidget(myContainer));
      print("size is $size");
    });

    loadingStart = false;
    loadingEnd = false;
    recalculating = false;
  }

  @override
  void initState() {
    super.initState();
    // WidgetsBinding.instance!.addPostFrameCallback((_) {
    //   scrollPosition = _scrollController.position.pixels;
    // });
  }

  @override
  Widget build(BuildContext context) {
    // final t = Padding(padding: EdgeInsets.all(0), child: Text("Yeshua loves you"));
    // final e = t.createElement();

    // final paddingRenderObject = t.createRenderObject(context);
    // paddingRenderObject.layout(BoxConstraints.loose(Size(MediaQuery.of(context).size.width, 1000)), parentUsesSize: true);
        

    // final testWidget = ShrinkWrappingViewport(offset: ViewportOffset.zero(), slivers: [
    //   // test 400px high container
    //   SliverToBoxAdapter(
    //     child: Container(
    //       height: 400,
    //       color: Colors.teal,
    //     ),
    //   ),
    // ]);
    // final element = testWidget.createElement();
    // element.attachRenderObject(null);
    // // element.renderObject?.layout(BoxConstraints.loose(Size(MediaQuery.of(context).size.width, 1000)), parentUsesSize: true);
        

    // final sliver = SliverToBoxAdapter(
    //   child: Container(
    //     height: 400,
    //     color: Colors.teal,
    //   ),
    // );
    // final sliverObject = sliver.createRenderObject(context);
    // // sliverObject.child = sliver.child!.createRenderObject(context);
    // final el = sliver.createElement();
    // el.updateChild(null, sliver.child, null);
    
    // final renderObject = testWidget.createRenderObject(context);
    // // final renderObject = element.renderObject as RenderShrinkWrappingViewport;
        // renderObject.layout(BoxConstraints.loose(Size(MediaQuery.of(context).size.width, 1000)), parentUsesSize: true);
        
    if (_children.length != widget.children.length || _children.firstOrNull != widget.children.firstOrNull) {
      print("recalculating");
      recalculate();
      print(_children.length);
    }

    List<Widget> slivers = [];
    for (int i = 0; i < _children.length; ++i) {
      final item = _children[i];
      slivers.add(SliverToBoxAdapter(key: ValueKey(item), child: widget.builder(context, i)));
    }

    return Scrollable(
      controller: _scrollController,
      axisDirection: scrollDirection,
      viewportBuilder: (BuildContext context, ViewportOffset offset) {
        print("offset");
                // if (slivers.isNotEmpty)
        //   offset.correctBy(100);
        return Viewport(offset: offset, slivers: slivers, axisDirection: scrollDirection);
      },
    );

    // return Scrollable();

    // // maxWidth: MediaQuery.of(context).size.width,
    // // maxHeight: 1000,
    // final constraints = SliverConstraints(
    //   axisDirection: AxisDirection.down,
    //   growthDirection: GrowthDirection.forward,
    //   userScrollDirection: AxisDirection.idle,
    //   scrollOffset: 0.0,
    //   precedingScrollExtent: 0.0,
    //   overlap: 0.0,
    //   remainingPaintExtent: 1000,
    //   crossAxisExtent: MediaQuery.of(context).size.width,
    //   crossAxisDirection: AxisDirection.right,
    //   viewportMainAxisExtent: 1000,
    //   remainingCacheExtent: 1000,
    //   cacheOrigin: 0.0,
    // );
    // // element.
    // // create render tree and insert

    // element.findRenderObject()?.layout(constraints);
            // renderObject.layout(constraints, parentUsesSize: true);
            
    // final viewport = Viewport(
    //   offset: _viewportOffset,
    //   axisDirection: AxisDirection.down,
    //   slivers: <Widget>[
    //     a
    //   ],
    // );
    // viewport.

    // render ScrollView with RenderViewport and RenderSliverList. Slivers should update their height
    // ScrollView()
    // SingleChildScrollView
    // ListView
    // return Scrollable(
    //   physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
    //   // dragStartBehavior: DragStartBehavior.down,
    //   axisDirection: AxisDirection.down,

    //   viewportBuilder: (context, offset) {
    //     print("offset is $offset");
    //     return Viewport(
    //       offset: _viewportOffset,
    //       axisDirection: AxisDirection.down,
    //       slivers:
    //         // SliverList.list(children: const [
    //         //   Padding(
    //         //     padding: EdgeInsets.fromLTRB(0, 500, 0, 500),
    //         //     child: Text("Yeshua loves you"),
    //         //   ),
    //         // ])
    //         // CustomSliverList(
    //         //   delegate: CustomSliverChildBuilderDelegate(
    //         //     (context, index) {
    //         //       final item = widget.children[index];
    //         //       currentItem = item;
    //         //       final itemInfo = itemsInfo[item];
    //         //       if (itemInfo != null) {
    //         //         return SizedBox(
    //         //           height: itemInfo.height,
    //         //           child: widget.builder(context, index),
    //         //         );
    //         //       }
    //         //       return SizedBox(
    //         //         height: 100.0,
    //         //         child: widget.builder(context, index),
    //         //       );
    //         //     },
    //         //     childCount: widget.children.length ?? 0,
    //         //   ),
    //         //   builder: widget.builder,
    //         //   children: widget.children ?? []
    //         // ),
    //     );
    //   },
    //   // controller: _scrollController,
    // );
  }
}

class CustomSliverChildBuilderDelegate extends SliverChildBuilderDelegate {
  CustomSliverChildBuilderDelegate(
    Widget Function(BuildContext, int) builder, {
    int? childCount,
  }) : super(builder, childCount: childCount);

  @override
  didFinishLayout(int firstIndex, int lastIndex) {
    // set height on each item
    for (int i = firstIndex; i <= lastIndex; ++i) {
      // final child = children[i];
      // final childParentData = child.parentData as SliverMultiBoxAdaptorParentData;
      // childParentData.layoutOffset = 100.0;
    }
  }
}

// custom SliverList class that gets height of childre
class CustomSliverList extends SliverList {
  CustomSliverList({
    required this.delegate,
    required this.builder,
    required this.children,
  }) : super(delegate: delegate);

  final SliverChildDelegate delegate;
  final Widget Function(BuildContext context, int index) builder;
  final List<dynamic> children;

  @override
  RenderSliverList createRenderObject(BuildContext context) {
    return RenderCustomSliverList(
      childManager: SliverMultiBoxAdaptorElement(
        this,
      ),
      builder: builder,
      children: children,
    );
  }
}

class RenderCustomSliverList extends RenderSliverList {
  RenderCustomSliverList({
    required RenderSliverBoxChildManager childManager,
    required this.builder,
    required this.children,
  }) : super(childManager: childManager);

  final Widget Function(BuildContext context, int index) builder;
  final List<dynamic> children;

  @override
  void performLayout() {
    super.performLayout();
    for (int i = 0; i < children.length; ++i) {
      final child = children[i];
      final childParentData = child.parentData as SliverMultiBoxAdaptorParentData;
      childParentData.layoutOffset = 100.0;
    }
  }
}

// void main() => runApp(MyApp());

// class MyApp extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       home: ScrollableTest(),
//     );
//   }
// }

// class ScrollableTest extends StatefulWidget {
//   @override
//   _ScrollableTestState createState() => _ScrollableTestState();
// }

// class _ScrollableTestState extends BetterState<ScrollableTest> {
//   final _controller = ScrollController();

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Scrollable(
//         controller: _controller,
//         viewportBuilder: (BuildContext context, ViewportOffset offset) {
//           return Viewport(
//             offset: offset,
//             slivers: <Widget>[
//               SliverToBoxAdapter(
//                 child: Container(
//                   height: 1000,
//                   color: Colors.teal,
//                 ),
//               ),
//               SliverPadding(
//                 padding: EdgeInsets.all(100),
//               ),
//               SliverToBoxAdapter(
//                 child: Container(
//                   height: 1000,
//                   color: Colors.purple,
//                 ),
//               ),
//             ],
//           );
//         },
//       ),
//     );
//   }
// }
