import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';

import '../views/share_view/share_view.dart';

class RefreshController extends StatelessWidget with  ChangeNotifier {
  Widget Function()? child;

  update() {
    print("refresh controller updating");
    notifyListeners();
  }

  setChild(Widget Function()? child) {
    this.child = child; 
    return this;
  }

  @override    
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: this,
      child: Consumer<RefreshController>(
        builder: (context, data, child) {
                              if(this.child != null) {
            return this.child!();
          } else {
            return Container();
          }
        }
      )
    );
  }
}