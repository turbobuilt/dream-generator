// import 'dart:math';

// import 'package:dev/helpers/network_helper.dart';
// import 'package:dev/helpers/router.dart';
// import 'package:dev/main.dart';
// import 'package:dev/views/share_view.dart';
// import 'package:dev/views/top_bar_view.dart';
// import 'package:flutter/material.dart' hide Checkbox;
// import 'package:flutter/cupertino.dart';
// // import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'package:flutter_contacts/flutter_contacts.dart';

// class ShareCreditViewState {
//   var showContacts = false;
//   late BuildContext context;
//   List<Contact>? contacts;
//   List<Contact>? sortedContacts;
//   Map<String, bool> selected = {};
//   String search = "";
//   Map<String, bool> alreadyShared = {};
//   var sendingEmails = false;
//   var searchController = TextEditingController();
//   var gettingExisting = false;
//   final maxPerDay = 100;
//   var message = "";
//   var messageController = TextEditingController();

//   ShareCreditViewState() {}

//   get countSelected {
//     return selected.values.where((element) => element).length;
//   }
// }

// // changenotifierprovider
// class ShareCreditView extends StatelessWidget with ChangeNotifier {
//   var state = ShareCreditViewState();

//   ShareCreditView() {
//     getShareEmail();
//     // getContacts();
//   }

//   getShareEmail() {
//     getRequest("/api/share-email").then((response) {
//       if (response.error != null && response.error != "") {
//         print(response.error);
//         return;
//       }
//       if (response.result?["shareEmail"] != null && response.result?["shareEmail"] != "") {
//         state.message = response.result?["shareEmail"] ?? "";
//         state.messageController.text = state.message;
//         notifyListeners();
//       }
//     }).catchError((e) {
//       print("error getting share email");
//       print(e);
//     });
//   }

//   getContacts() async {
//     AlertDialog(
//       title: const Text('AlertDialog Title'),
//       content: const SingleChildScrollView(
//         child: ListBody(
//           children: <Widget>[
//             Text('This feature has been disabled for the time being.'),
//             Text('Google keeps flagging it for some reason...'),
//             Text('They claim my disclosures are not big enough... I dont know')
//           ],
//         ),
//       ),
//       actions: <Widget>[
//         TextButton(
//           child: const Text('Approve'),
//           onPressed: () {
//             Navigator.of(state.context).pop();
//           },
//         ),
//       ],
//     );
//     return;
//     if (await FlutterContacts.requestPermission()) {
//       print("Getting existing");
//       getExistingEmails();
//       state.contacts = await FlutterContacts.getContacts(withProperties: true, withPhoto: true);
//       filterContacts("");
//     } else {
//       // alert dialog
//       AlertDialog(
//         title: const Text('AlertDialog Title'),
//         content: const SingleChildScrollView(
//           child: ListBody(
//             children: <Widget>[
//               Text('Error getting contacts list.'),
//             ],
//           ),
//         ),
//         actions: <Widget>[
//           TextButton(
//             child: const Text('Approve'),
//             onPressed: () {
//               Navigator.of(state.context).pop();
//             },
//           ),
//         ],
//       );
//     }
//   }

//   getExistingEmails() async {
//     return;
//     state.gettingExisting = true;
//     notifyListeners();
//     final emails = [];
//     for (final contact in state.contacts ?? []) {
//       for (final email in contact.emails) {
//         emails.add(email.address);
//       }
//     }
//     final response = await postRequest("/api/shared-emails", {"emails": emails});
//     state.gettingExisting = false;
//     if (response.error != null && response.error != "") {
//       print(response.error);
//       notifyListeners();
//       return;
//     }
//     state.alreadyShared = {};
//     for (final email in response.result?["items"] ?? []) {
//       state.alreadyShared[email] = true;
//     }
//     print(state.alreadyShared);
//     if (state.contacts != null) {
//       filterContacts("");
//     }
//     notifyListeners();
//   }

//   filterContacts(String search) {
//     state.sortedContacts = state.contacts?.toList();
//     state.sortedContacts?.removeWhere((element) => element.emails.isEmpty);
//     state.sortedContacts?.removeWhere((element) => state.alreadyShared[element.emails.first.address] == true);
//     if (search != "") {
//       state.sortedContacts?.removeWhere((element) => !element.displayName.toLowerCase().contains(search.toLowerCase()));
//     }
//     // sort so that items with imageOrThumbnail are first
//     state.sortedContacts?.sort((a, b) {
//       if (a.photoOrThumbnail != null && b.photoOrThumbnail == null) {
//         return -1;
//       } else if (a.photoOrThumbnail == null && b.photoOrThumbnail != null) {
//         return 1;
//       }
//       return a.displayName.compareTo(b.displayName);
//     });
//     notifyListeners();
//   }

//   sendEmails() async {
//     if (state.sendingEmails) {
//       return;
//     }
//     // final selectedContacts = selected.entries.where((element) => element.value).map((e) => e.key).toList();
//     final selectedContacts = state.contacts?.where((element) => state.selected[element.emails.firstOrNull?.address] ?? false);

//     state.sendingEmails = true;
//     notifyListeners();
//     postRequest("/api/share-email", {"shareEmail": state.message}).catchError((e) {
//       print("error saving share email");
//       print(e);
//     });
//     final result = await postRequest("/api/send-share-email", {"contacts": selectedContacts?.toList()});
//     state.sendingEmails = false;
//     notifyListeners();

//     // globalAuthenticatedUser.name = "";

//     print("results remaining are ${result.result?["creditsRemaining"]}");
//     // check if result.result["creditsRemaining"] exists and if so update
//     if (result.result?["creditsRemaining"] != null) {
//       globalAuthenticatedUser.creditsRemaining = result.result?["creditsRemaining"];
//       globalTopBarViewData.notifyListeners();
//     }
//     getExistingEmails();

//     AlertDialog? dialog;
//     if (result.error?.isNotEmpty == true) {
//       dialog = AlertDialog(
//         // title: const Text('AlertDialog Title'),
//         content: SingleChildScrollView(
//           child: ListBody(
//             children: <Widget>[
//               const Text('Error sending emails.'),
//               const SizedBox(height: 20),
//               Text(result.error ?? ''),
//             ],
//           ),
//         ),
//         actions: <Widget>[
//           TextButton(
//             child: const Text('Ok'),
//             onPressed: () {
//               Navigator.of(state.context).pop();
//             },
//           ),
//         ],
//       );
//     } else {
//       if (globalAuthenticatedUser.name == "") {
//         // dialog that asks for their name
//         final nameController = TextEditingController();
//         dialog = AlertDialog(
//           // title: const Text('AlertDialog Title'),
//           content: SingleChildScrollView(
//             child: ListBody(
//               children: <Widget>[
//                 const Text("Great! Just need your name!"),
//                 // const Text('Please enter your name.'),
//                 const SizedBox(height: 20),
//                 TextField(
//                   controller: nameController,
//                   autocorrect: false,
//                   autofocus: true,
//                   decoration: const InputDecoration(
//                     hintText: "Name",
//                     contentPadding: EdgeInsets.all(5),
//                     // border: OutlineInputBorder(),
//                   ),
//                 ),
//               ],
//             ),
//           ),
//           actions: <Widget>[
//             TextButton(
//               child: const Text('Ok'),
//               onPressed: () async {
//                 final name = nameController.text;
//                 if (name == "") {
//                   return;
//                 }
//                 final response = await postRequest("/api/set-name", {"name": name});
//                 if (response.error != null && response.error != "") {
//                   print(response.error);
//                   Navigator.of(state.context).pop();
//                   return;
//                 }
//                 globalAuthenticatedUser.name = name;
//                 globalStore.saveUserData();
//                 router.pop();
//                 showSuccessModal();
//                 // globalTopBarViewData.notifyListeners();
//                 // Navigator.of(state.context).pop();
//                 // router.push("/share");
//               },
//             ),
//           ],
//         );
//       } else {
//         showSuccessModal();
//       }
//     }
//     if (dialog != null && state.context.mounted == true) {
//       // ignore: use_build_context_synchronously
//       await showDialog(
//         context: state.context,
//         builder: (BuildContext context) {
//           return dialog!;
//         },
//       );
//     }
//   }

//   showSuccessModal() async {
//     var closeModal = true;
//     var dialog = AlertDialog(
//       // title: const Text('AlertDialog Title'),
//       content: const SingleChildScrollView(
//         child: ListBody(
//           children: <Widget>[
//             Text('Awesome! You\'ve got some credits!'),
//           ],
//         ),
//       ),
//       actions: <Widget>[
//         TextButton(
//           child: const Text('Ok'),
//           onPressed: () {
//             Navigator.of(state.context).pop();
//           },
//         ),
//       ],
//     );
//     await showDialog(
//       context: state.context,
//       builder: (BuildContext context) {
//         return dialog;
//       },
//     );
//     if (closeModal) {
//       router.pop();
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     state.context = context;
//     return Scaffold(
//       body: ChangeNotifierProvider.value(
//         value: this,
//         child: Consumer<ShareCreditView>(builder: (context, data, child) {
//           return Column(
//             children: [
//               Container(
//                   // background gradient left to right blue to purple
//                   decoration: const BoxDecoration(
//                     gradient: LinearGradient(
//                       begin: Alignment.topLeft,
//                       end: Alignment.bottomRight,
//                       colors: [Colors.blue, Colors.purple],
//                     ),
//                   ),
//                   child: AppBar(title: const Text(''))),
//               Expanded(
//                 child: Padding(
//                   padding: const EdgeInsets.all(20),
//                   child: Column(
//                     children: [
//                       if (!state.showContacts) ...{
//                         const SizedBox(height: 50),
//                         const Text("1. Write Email"),
//                         const SizedBox(height: 20),
//                         const Text("2. Pick Contacts"),
//                         const SizedBox(height: 21),
//                         const Text("3. Send Email Automatically"),
//                         const SizedBox(height: 23),
//                         const Text("4. Free Credits!"),
//                         const SizedBox(height: 5),
//                         // text input for message
//                         Container(
//                           // max width 80%
//                           constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * .8),
//                           child: TextField(
//                             decoration: const InputDecoration(
//                               hintText:
//                                   "What will you say to your friends? Thanks for sharing by the way! Your helping me grow the app so you get free credits!",
//                               label: Text("Message Content (Optional)"),
//                               contentPadding: EdgeInsets.all(5),
//                               // border: OutlineInputBorder(),
//                             ),
//                             controller: state.messageController,
//                             autocorrect: true,
//                             maxLines: 10,
//                             minLines: 1,
//                             onChanged: (text) {
//                               state.message = text;
//                             },
//                           ),
//                         ),
//                         const SizedBox(height: 15),
//                         ElevatedButton(
//                           style: ElevatedButton.styleFrom(
//                             minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
//                           ),
//                           onPressed: () async {
//                             if (await FlutterContacts.requestPermission()) {
//                               state.contacts = await FlutterContacts.getContacts(withProperties: true, withPhoto: true);
//                               await getExistingEmails();
//                               state.showContacts = true;
//                               filterContacts("");
//                             }
//                           },
//                           child: Text(state.gettingExisting ? "Working..." : "Select Contacts"),
//                         ),
//                       } else ...{
//                         TextField(
//                           // placeholder "Search"
//                           decoration: const InputDecoration(
//                             hintText: "Search",
//                             contentPadding: EdgeInsets.all(5),
//                             // border: OutlineInputBorder(),
//                           ),
//                           controller: state.searchController,
//                           autocorrect: false,
//                           onChanged: (text) {
//                             state.search = text;
//                             filterContacts(text);
//                           },
//                         ),
//                         const SizedBox(height: 12),
//                         const Text("We are going to email your friends with a nice email saying Hi [Your Name] gave us your email and wanted to share Dream Generator with you!  We will put some cool information about how to use the app, and show any cool publishes that you have already!  So make sure to publish some cool stuff before posting to friends."),
//                         const SizedBox(height: 17),
//                         Text("1 credit per contact, max ${state.maxPerDay} per day."),
//                         const SizedBox(height: 8),
//                         ElevatedButton(
//                           style: ElevatedButton.styleFrom(
//                             // backgroundColor: state.selected.values.where((element) => element).isNotEmpty ? null : Colors.grey,
//                             minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
//                           ),
//                           onPressed: () {
//                             state.selected = {};
//                             for (final contact in state.sortedContacts ?? []) {
//                               state.selected[contact.emails.first.address] = false;
//                             }
//                             var count = 0;
//                             for (final contact in state.sortedContacts ?? []) {
//                               if (count++ >= state.maxPerDay) {
//                                 break;
//                               }
//                               state.selected[contact.emails.first.address] = true;
//                             }
//                             notifyListeners();
//                           },
//                           child: Text("Select Top ${state.maxPerDay}"),
//                         ),
//                         ElevatedButton(
//                           style: ElevatedButton.styleFrom(
//                             backgroundColor: state.selected.values.where((element) => element).isNotEmpty ? null : Colors.grey,
//                             minimumSize: Size(MediaQuery.of(context).size.width * .8, 20),
//                           ),
//                           onPressed: () {
//                             sendEmails();
//                           },
//                           child: Text("Share with ${state.countSelected} friends"),
//                         ),
//                         SizedBox(height: 10),
//                         Expanded(
//                           child: GridView.builder(
//                             padding: const EdgeInsets.all(0),
//                             shrinkWrap: true,
//                             itemCount: state.sortedContacts?.length ?? 0,
//                             physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
//                             gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
//                               crossAxisCount: 2,
//                               // childAspectRatio: 5,
//                               crossAxisSpacing: 5,
//                               mainAxisSpacing: 5,
//                             ),
//                             itemBuilder: (context, index) {
//                               final contact = state.sortedContacts![index];
//                               return Container(
//                                 // border bottom 1px solid gray
//                                 decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Colors.grey, width: 1))),
//                                 child: GestureDetector(
//                                   onTap: () {
//                                     // if more than 10 selected, don't allow
//                                     if (state.selected.values.where((element) => element).length >= state.maxPerDay &&
//                                         state.selected[contact.emails.first.address] != true) {
//                                       return;
//                                     }
//                                     state.selected[contact.emails.first.address] =
//                                         state.selected[contact.emails.first.address] == true ? false : true;
//                                     notifyListeners();
//                                   },
//                                   child: Container(
//                                     // make it a rounded rectangle with 2px gray border. Border radius is 5 px
//                                     decoration: BoxDecoration(
//                                       border: Border.all(color: Colors.grey, width: 2),
//                                       borderRadius: BorderRadius.circular(5),
//                                     ),
//                                     child: Column(
//                                       children: [
//                                         //  contact.photoOrThumbnail != null ? CircleAvatar(backgroundImage: MemoryImage(contact.photoOrThumbnail!)) : const SizedBox(width: 0),
//                                         // container with either photoOrThumbnail, or the first letter of their name with random background color
//                                         Row(children: [
//                                           CupertinoCheckbox(
//                                               value: state.selected[contact.emails.first.address] ?? false,
//                                               onChanged: (value) {
//                                                 // if more than 10 selected, don't allow
//                                                 if (state.selected.values.where((element) => element).length >= 10 && value == true) {
//                                                   return;
//                                                 }
//                                                 state.selected[contact.emails.first.address] = value!;
//                                                 notifyListeners();
//                                               }),
//                                           const SizedBox(width: 10),
//                                           Text(contact.displayName != "" ? contact.displayName : contact.emails.first.address),
//                                         ]),
//                                         Container(
//                                           // background color
//                                           color: state.selected[contact.emails.first.address] == true ? Colors.blue : Colors.transparent,
//                                           child: contact.photoOrThumbnail != null
//                                               ? CircleAvatar(backgroundImage: MemoryImage(contact.photoOrThumbnail!), radius: 50)
//                                               : CircleAvatar(
//                                                   backgroundColor: Colors.primaries[Random().nextInt(Colors.primaries.length)],
//                                                   child: Text(contact.displayName.substring(0, 1)),
//                                                   radius: 50
//                                                 ),
//                                         ),
//                                       ],
//                                     ),
//                                   ),
//                                 ),
//                               );
//                             },
//                           ),
//                         ),
//                       }
//                     ],
//                   ),
//                 ),
//               ),
//             ],
//           );
//         }),
//       ),
//     );
//   }
// }
