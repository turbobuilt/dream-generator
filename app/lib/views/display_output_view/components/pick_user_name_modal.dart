import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/vars.dart';
import 'package:dev/views/display_output_view/components/publish_image_button.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

tryShowPickUserNameModal(BuildContext context, {force = false}) async  {
  if (globalAuthenticatedUser.userName != null && globalAuthenticatedUser.userName != "" && !force) {
    return false;
  }
  var newUserName = "";
  var textController = TextEditingController();
  // limit to 20 chars
  textController.addListener(() {
    if (textController.text.length > 20) {
      textController.text = textController.text.substring(0, 20);
      textController.selection = TextSelection.fromPosition(TextPosition(offset: textController.text.length));
    }
  });
  bool? available;
  bool loadingAvailability = false;
  String error = "";
  bool saving = false;
  
  await showDialog(
    context: context,
    builder: (BuildContext context) {
      return StatefulBuilder(
        builder: (context, setStateSB) {
          return AlertDialog(
            title: const Text("Pick a user name!"),
            content: SizedBox(
              width: MediaQuery.of(context).size.width * 0.9,
              // height: MediaQuery.of(context).size.height * 0.9,
              child: ListView(
                padding: const EdgeInsets.all(0),
                shrinkWrap: true,
                children: [
                  StatefulBuilder(builder: (context, childSetState) {
                    return Row(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Expanded(
                          child: TextField(
                            // value is newUserName
                            autocorrect: false,
                            controller: textController,
                            decoration: const InputDecoration(
                              // border: OutlineInputBorder(),
                              isDense: true,
                              labelText: 'User Name',
                            ),

                            onChanged: (text) async {
                              newUserName = text;
                              if (text == "") {
                                available = null;
                                return;
                              }
                              childSetState(() => loadingAvailability = true);
                              final result = await getRequest("/api/check-user-name?userName=$text");
                              if (result.error?.isNotEmpty == true) {
                                childSetState(() {
                                  error = result.error ?? "";
                                  loadingAvailability = false;
                                });
                                return;
                              }
                              childSetState(() {
                                available = result.result["available"];
                                loadingAvailability = false;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 5),
                        if (loadingAvailability)
                          const CupertinoActivityIndicator()
                        else if (available != null)
                          available == true // show green check or red x
                              ? const Icon(Icons.check, color: Colors.green)
                              : const Icon(Icons.close, color: Colors.red),
                      ],
                    );
                  }),
                  const SizedBox(height: 8),
                  if (error != "") Expanded(child: Text(error)),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    // 80% width
                    style: ButtonStyle(
                      backgroundColor: !loadingAvailability && available == true
                          ? MaterialStateProperty.all(primaryBackground)
                          : MaterialStateProperty.all(Colors.grey.shade500),
                      foregroundColor: MaterialStateProperty.all(Colors.white),
                      minimumSize: MaterialStateProperty.all(Size(MediaQuery.of(context).size.width * .8, 20)),
                    ),
                    onPressed: () async {
                      saving = true;
                      final result = await postRequest("/api/save-user-name?userName=$newUserName", {});
                      // wait 20 seconds
                      // await Future.delayed(const Duration(seconds: 20));
                      saving = false;
                      if (result.error?.isNotEmpty == true) {
                        setStateSB(() {
                          error = result.error ?? "";
                          loadingAvailability = false;
                        });
                        return;
                      }
                      setStateSB(() {
                        loadingAvailability = false;
                        globalAuthenticatedUser.userName = newUserName;
                      });
                      globalStore.saveUserData();
                      router.pop();
                    },
                    child: saving ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2) : const Text("Save Username"),
                  ),
                ],
              ),
            ),
          );
        },
      );
    },
  );
}
