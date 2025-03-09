import 'package:dev/helpers/network_helper.dart';
import 'package:dev/helpers/router.dart';
import 'package:dev/main.dart';
import 'package:dev/views/share_view/share_view.dart';
import 'package:dev/views/top_bar_view.dart';
import 'package:flutter/material.dart' hide Checkbox;
import 'package:flutter/cupertino.dart';
// import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_contacts/flutter_contacts.dart';

class ShareCreditViewState {
  var showContacts = false;
  late BuildContext context;
  List<Contact>? contacts;
  List<Contact>? sortedContacts;
  Map<String, bool> selected = {};
  String search = "";
  Map<String, bool> alreadyShared = {};
  var sendingEmails = false;
  var searchController = TextEditingController();
  var gettingExisting = false;
  final maxPerDay = 1000;
  var message = "";
  var messageController = TextEditingController();

  ShareCreditViewState() {}

  get countSelected {
    return selected.values.where((element) => element).length;
  }
}

// changenotifierprovider
class ShareCreditView extends StatelessWidget with ChangeNotifier {
  final state = ShareCreditViewState();

  ShareCreditView() {
    getShareEmail();
    // getContacts();
  }

  getShareEmail() {
    getRequest("/api/share-email").then((response) {
      if (response.error != null && response.error != "") {
        print(response.error);
        return;
      }
      if (response.result?["shareEmail"] != null && response.result?["shareEmail"] != "") {
        state.message = response.result?["shareEmail"] ?? "";
        state.messageController.text = state.message;
        notifyListeners();
      }
    }).catchError((e) {
      print("error getting share email");
      print(e);
    });
  }

  getContacts() async {
    if (await FlutterContacts.requestPermission()) {
      print("Getting existing");
      getExistingEmails();
      state.contacts = await FlutterContacts.getContacts(withProperties: true, withPhoto: true);
      filterContacts("");
    } else {
      // alert dialog
      AlertDialog(
        title: const Text('AlertDialog Title'),
        content: const SingleChildScrollView(
          child: ListBody(
            children: <Widget>[
              Text('Error getting contacts list.'),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            child: const Text('Approve'),
            onPressed: () {
              Navigator.of(state.context).pop();
            },
          ),
        ],
      );
    }
  }

  getExistingEmails() async {
    state.gettingExisting = true;
    notifyListeners();
    final emails = [];
    for (final contact in state.contacts ?? []) {
      for (final email in contact.emails) {
        emails.add(email.address);
      }
    }
    final response = await postRequest("/api/shared-emails", {"emails": emails});
    state.gettingExisting = false;
    if (response.error != null && response.error != "") {
      print(response.error);
      notifyListeners();
      return;
    }
    state.alreadyShared = {};
    for (final email in response.result?["items"] ?? []) {
      state.alreadyShared[email] = true;
    }
    print(state.alreadyShared);
    if (state.contacts != null) {
      filterContacts("");
    }
    notifyListeners();
  }

  filterContacts(String search) {
    state.sortedContacts = state.contacts?.toList();
    state.sortedContacts?.removeWhere((element) => element.emails.isEmpty);
    state.sortedContacts?.removeWhere((element) => state.alreadyShared[element.emails.first.address] == true);
    if (search != "") {
      state.sortedContacts?.removeWhere((element) => !element.displayName.toLowerCase().contains(search.toLowerCase()));
    }
    notifyListeners();
  }

  sendEmails() async {
    if (state.sendingEmails) {
      return;
    }
    // final selectedContacts = selected.entries.where((element) => element.value).map((e) => e.key).toList();
    final selectedContacts = state.contacts?.where((element) => state.selected[element.emails.firstOrNull?.address] ?? false);

    state.sendingEmails = true;
    notifyListeners();
    postRequest("/api/share-email", {"shareEmail": state.message}).catchError((e) {
      print("error saving share email");
      print(e);
    });
    final result = await postRequest("/api/send-share-email", {"contacts": selectedContacts?.toList()});
    state.sendingEmails = false;
    notifyListeners();

    facebookAppEvent.logEvent(name: "shared_emails", parameters: {
      "email_count": selectedContacts?.length ?? 0,
    }).catchError((e) => {
          print("error logging share emails event"),
          print(e),
        });

    // globalAuthenticatedUser.name = "";

    print("results remaining are ${result.result?["creditsRemaining"]}");
    // check if result.result["creditsRemaining"] exists and if so update
    if (result.result?["creditsRemaining"] != null) {
      globalAuthenticatedUser.creditsRemaining = double.tryParse((result.result?["creditsRemaining"] ?? 0).toString()) ?? 0;
      globalTopBarViewData.notifyListeners();
    }
    getExistingEmails();

    AlertDialog? dialog;
    if (result.error?.isNotEmpty == true) {
      dialog = AlertDialog(
        // title: const Text('AlertDialog Title'),
        content: SingleChildScrollView(
          child: ListBody(
            children: <Widget>[
              const Text('Error sending emails.'),
              const SizedBox(height: 20),
              Text(result.error ?? ''),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            child: const Text('Ok'),
            onPressed: () {
              Navigator.of(state.context).pop();
            },
          ),
        ],
      );
    } else {
      if (globalAuthenticatedUser.name == "") {
        // dialog that asks for their name
        final nameController = TextEditingController();
        dialog = AlertDialog(
          // title: const Text('AlertDialog Title'),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                const Text("Great! Please share your name so we can let them know who's sending the email."),
                // const Text('Please enter your name.'),
                const SizedBox(height: 20),
                TextField(
                  controller: nameController,
                  autocorrect: false,
                  autofocus: true,
                  decoration: const InputDecoration(
                    hintText: "Name",
                    contentPadding: EdgeInsets.all(5),
                    // border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('Ok'),
              onPressed: () async {
                final name = nameController.text;
                if (name == "") {
                  return;
                }
                final response = await postRequest("/api/set-name", {"name": name});
                if (response.error != null && response.error != "") {
                  print(response.error);
                  Navigator.of(state.context).pop();
                  return;
                }
                globalAuthenticatedUser.name = name;
                globalStore.saveUserData();
                router.pop();
                showSuccessModal();
                // globalTopBarViewData.notifyListeners();
                // Navigator.of(state.context).pop();
                // router.push("/share");
              },
            ),
          ],
        );
      } else {
        showSuccessModal();
      }
    }
    if (dialog != null && state.context.mounted == true) {
      // ignore: use_build_context_synchronously
      await showDialog(
        context: state.context,
        builder: (BuildContext context) {
          return dialog!;
        },
      );
    }
  }

  showSuccessModal() async {
    var closeModal = true;
    var dialog = AlertDialog(
      // title: const Text('AlertDialog Title'),
      content: const SingleChildScrollView(
        child: ListBody(
          children: <Widget>[
            Text('Awesome! You\'ve got some credits!'),
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          child: const Text('Ok'),
          onPressed: () {
            Navigator.of(state.context).pop();
          },
        ),
      ],
    );
    await showDialog(
      context: state.context,
      builder: (BuildContext context) {
        return dialog;
      },
    );
    if (closeModal) {
      router.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    state.context = context;
    return Scaffold(
      body: ChangeNotifierProvider.value(
        value: this,
        child: Consumer<ShareCreditView>(builder: (context, data, child) {
          return Column(
            children: [
              Container(
                  // background gradient left to right blue to purple
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Colors.blue, Colors.purple],
                    ),
                  ),
                  child: AppBar(title: const Text(''))),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      if (!state.showContacts) ...{
                        const SizedBox(height: 50),
                        // const Text("1. Write Email"),
                        // const SizedBox(height: 20),
                        const Text("1. Pick Contacts"),
                        const SizedBox(height: 21),
                        const Text("2. Send Email Automatically"),
                        const SizedBox(height: 23),
                        const Text("3. Free Credits!"),
                        const SizedBox(height: 5),
                        // text input for message
                        // Container(
                        //   // max width 80%
                        //   constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * .8),
                        //   child: TextField(
                        //     decoration: const InputDecoration(
                        //       hintText:
                        //           "What will you say to your friends? Thanks for sharing by the way! Your helping me grow the app so you get free credits!",
                        //       label: Text("Message Content (Optional)"),
                        //       contentPadding: EdgeInsets.all(5),
                        //       // border: OutlineInputBorder(),
                        //     ),
                        //     controller: state.messageController,
                        //     autocorrect: true,
                        //     maxLines: 10,
                        //     minLines: 1,
                        //     onChanged: (text) {
                        //       state.message = text;
                        //     },
                        //   ),
                        // ),
                        // const SizedBox(height: 15),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
                          ),
                          onPressed: () async {
                            if (await FlutterContacts.requestPermission(readonly: true)) {
                              state.contacts = await FlutterContacts.getContacts(withProperties: true, withPhoto: true);
                              await getExistingEmails();
                              state.showContacts = true;
                              filterContacts("");
                            } else {
                              print("Error getting contacts");
                            }
                          },
                          child: Text(state.gettingExisting ? "Working..." : "Select Contacts"),
                        ),
                        const SizedBox(height: 10),
                        const Text("Note: all your contacts email addresses will be sent to our servers and they will all receive an email from DreamGenerator.ai.  We will keep the email stored on our server to make sure if anybody else shares to them, they won't get extranous emails."),
                        const Spacer(),
                        const Text(
                            "When you grant permission to view contacts, we will immediateley perform a cross check between your contacts emails and the people we have already emailed to make sure you don't submit contacts that we have already emailed.  This helps prevent spam.  To do the cross check, your phone will send the list of all the emails of your contacts to our server.  There the computer checks if any of them are in our database, and omits those from the list.  None of this is logged or tracked, and we don't keep this information in any way.  It is completely private.  It is strictly to make sure we don't spam anybody and you get credits for sending to new people.\n\nThen you will get to pick what people you actually want to send emails to.  We keep track of who we have emailed long term so we don't spam anybody. You can anonymize this information by deleting your account. We do not share the data except to email providers to send an email to your friend.")
                      } else ...{
                        TextField(
                          // placeholder "Search"
                          decoration: const InputDecoration(
                            hintText: "Search",
                            contentPadding: EdgeInsets.all(5),
                            // border: OutlineInputBorder(),
                          ),
                          controller: state.searchController,
                          autocorrect: false,
                          onChanged: (text) {
                            state.search = text;
                            filterContacts(text);
                          },
                        ),
                        const SizedBox(height: 17),
                        Text("1 credit per contact"),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            // backgroundColor: state.selected.values.where((element) => element).isNotEmpty ? null : Colors.grey,
                            minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
                          ),
                          onPressed: () {
                            state.selected = {};
                            for (final contact in state.sortedContacts ?? []) {
                              state.selected[contact.emails.first.address] = false;
                            }
                            var count = 0;
                            for (final contact in state.sortedContacts ?? []) {
                              // if (count++ >= state.maxPerDay) {
                              //   break;
                              // }
                              state.selected[contact.emails.first.address] = true;
                            }
                            notifyListeners();
                          },
                          child: Text("Select All"),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: state.selected.values.where((element) => element).isNotEmpty ? null : Colors.grey,
                            minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
                          ),
                          onPressed: () {
                            sendEmails();
                          },
                          child: Text("Share with ${state.countSelected} friends"),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.all(0),
                            shrinkWrap: true,
                            itemCount: state.sortedContacts?.length ?? 0,
                            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                            itemBuilder: (context, index) {
                              final contact = state.sortedContacts![index];
                              return Container(
                                // border bottom 1px solid gray
                                decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey, width: 1))),
                                child: GestureDetector(
                                  onTap: () {
                                    // if more than 10 selected, don't allow
                                    if (state.selected.values.where((element) => element).length >= state.maxPerDay &&
                                        state.selected[contact.emails.first.address] != true) {
                                      return;
                                    }
                                    state.selected[contact.emails.first.address] =
                                        state.selected[contact.emails.first.address] == true ? false : true;
                                    notifyListeners();
                                  },
                                  child: Row(children: [
                                    CupertinoCheckbox(
                                        value: state.selected[contact.emails.first.address] ?? false,
                                        onChanged: (value) {
                                          // if more than 10 selected, don't allow
                                          if (state.selected.values.where((element) => element).length >= 10 && value == true) {
                                            return;
                                          }
                                          state.selected[contact.emails.first.address] = value!;
                                          notifyListeners();
                                        }),
                                    contact.photoOrThumbnail != null
                                        ? CircleAvatar(backgroundImage: MemoryImage(contact.photoOrThumbnail!))
                                        : const SizedBox(width: 0),
                                    const SizedBox(width: 10),
                                    Text(contact.displayName != "" ? contact.displayName : contact.emails.first.address),
                                  ]),
                                ),
                              );
                            },
                          ),
                        ),
                      }
                    ],
                  ),
                ),
              ),
              TextButton(
                onPressed: () => router.push("/simple-privacy"),
                child: const Text(
                  "Privacy",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.normal, color: Colors.grey),
                ),
              ),
              const SizedBox(height: 10),
            ],
          );
        }),
      ),
    );
  }
}
