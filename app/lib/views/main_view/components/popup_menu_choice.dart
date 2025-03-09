import 'package:dev/views/main_view/components/main_tab_bar.dart';
import 'package:dev/views/notifications_view/notifications_state.dart';
import 'package:flutter/material.dart';

class PopupMenuChoice extends StatelessWidget {
  final MenuItem menuItem;
  final Function onTap;
  const PopupMenuChoice({required this.menuItem, required this.onTap});

  @override
  Widget build(BuildContext context) {
    // get available witdth
    var width = MediaQuery.of(context).size.width - 45;
    var buttonStyle = ButtonStyle(
      backgroundColor: MaterialStateProperty.all(Colors.transparent),
      padding: MaterialStateProperty.all(EdgeInsets.zero),
      shadowColor: MaterialStateProperty.all(Colors.transparent),
      overlayColor: MaterialStateProperty.all(Colors.transparent),
      foregroundColor: MaterialStateProperty.all(Colors.black),
      fixedSize: MaterialStateProperty.all(Size(width / 4, 50)),
    );
    return TextButton(
      onPressed: () => onTap(),
      style: buttonStyle,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Stack(
            children: [
              Icon(menuItem.icon),
              // small red circle top right showing notification count
              if (menuItem.value == Views.notificationsView && notificationsState.notifications.isNotEmpty)
                Positioned(
                  right: -1,
                  top: -4 ,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      border: Border.all(color: Colors.white, width: 1),
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      notificationsState.notifications.length.toString(),
                      style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
          Text(menuItem.label, style: const TextStyle(fontSize: 10)),
        ],
      ),
    );
  }
}