import 'dart:ffi';

import 'package:dev/helpers/better_state.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CupertinoSelectItem {
  final String label;
  final dynamic value;
  final String price;
  double priceNumber;

  CupertinoSelectItem({required this.label, required this.value, required this.price, required this.priceNumber});
}

class CupertinoSelectContainer extends StatefulWidget {
  final List<CupertinoSelectItem> items;
  final Function(dynamic) onSelectedItemChanged;
  EdgeInsets padding = const EdgeInsets.all(6);
  var label = "";
  dynamic value;

  CupertinoSelectContainer(
      {required this.items, required this.onSelectedItemChanged, required this.value, this.label = "", this.padding = const EdgeInsets.all(6)}) {
    // if (items.indexWhere((element) => element.value == value) == -1) {
    //   value = items[0].value;
    //   onSelectedItemChanged(items[0].value);
    // }
  }

  @override
  CupertinoSelectContainerState createState() => CupertinoSelectContainerState();
}

// CupertinoSelectContainerState shows a label to the left and selected value to the right.  Then when you click on either, it shows the CupertinoPicker with options using showCupertinoModalPopup
class CupertinoSelectContainerState extends BetterState<CupertinoSelectContainer> {
  get valueLabel {
    return widget.items.firstWhere((element) => element.value == widget.value).label;
  }

  @override
  Widget build(BuildContext context) {
    // if the selected value isn't in the list, then set it to the first item
    if (widget.items.indexWhere((element) => element.value == widget.value) == -1) {
      widget.value = widget.items[0].value;
      Future.delayed(const Duration(milliseconds: 1), () {
        widget.onSelectedItemChanged(widget.items[0].value);
      });
    }
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () {
            // cupertino picker
            showCupertinoModalPopup(
              context: context,
              builder: (BuildContext context) {
                return Container(
                  height: 200,
                  color: Colors.white,
                  child: CupertinoPicker(
                    itemExtent: 32,
                    // value
                    scrollController: FixedExtentScrollController(initialItem: widget.items.indexWhere((element) => element.value == widget.value)),
                    onSelectedItemChanged: (int index) {
                      widget.onSelectedItemChanged(widget.items[index].value);
                    },
                    children: widget.items
                        .map((e) => Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(e.label),
                                const SizedBox(width: 7),
                                Text(e.price, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                              ],
                            ))
                        .toList(),
                  ),
                );
              },
            );
          },
          child: Padding(
            padding: widget.padding,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(widget.label),
                const SizedBox(width: 5),
                Text(valueLabel, style: const TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
