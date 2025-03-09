import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

class CustomData extends SingleChildRenderObjectWidget {
  final dynamic data;

  CustomData({Key? key, this.data, Widget? child}) : super(key: key, child: child);

  @override
  RenderObject createRenderObject(BuildContext context) {
    return RenderCustomData(data, this);
  }

  @override
  void updateRenderObject(BuildContext context, covariant RenderCustomData renderObject) {
    renderObject.data = data;
    renderObject.widget = this;
  }
}

class RenderCustomData extends RenderProxyBox {
  dynamic data;
  Widget widget;
  double height = 0;

  RenderCustomData(this.data, this.widget) : super();


  @override
  void performLayout() {
    if(child == null) {
      size = Size.zero;
      height = 0;
      return;
    }
    child!.layout(constraints, parentUsesSize: true);
    size = child!.size;
    height = size.height;
    //your data can still be accessed here.
    // print(data);
  }
}
