import 'package:dev/lib/server_event_bus.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:flutter/foundation.dart';

class AuthenticatedUser extends ChangeNotifier {
  int? id;
  bool agreesToTerms = false;
  int autoPublish = 0;
  String callKitPushToken = "";
  double creditsRemaining = 0;
  String email = "";
  bool isOnTrial = false;
  String name = "";
  String? plan;
  bool trialDeclined = false;
  bool trialUsed = false;
  bool understandsPublishCommitment = false;
  String? userName;
  bool temporaryChatPopupShown = false;

  AuthenticatedUser({
    this.id,
    this.agreesToTerms = false,
    this.autoPublish = 0,
    this.callKitPushToken = "",
    this.creditsRemaining = 0,
    this.email = "",
    this.isOnTrial = false,
    this.name = "",
    this.plan,
    this.trialDeclined = false,
    this.trialUsed = false,
    this.understandsPublishCommitment = false,
    this.userName,
    this.temporaryChatPopupShown = false,
  });

  void clear() {
    id = null;
    agreesToTerms = false;
    autoPublish = 0;
    creditsRemaining = 0;
    email = "";
    isOnTrial = false;
    name = "";
    plan = null;
    trialDeclined = false;
    trialUsed = false;
    understandsPublishCommitment = false;
    userName = "";
    temporaryChatPopupShown = false;
    notifyListeners();
  }

  AuthenticatedUser fromMap(Map<String, dynamic> json) {
    var user = AuthenticatedUser();
    user.applyMapValues(json);
    return user;
  }

  void applyMapValues(Map<dynamic, dynamic> json) {
    id = json['id'];
    agreesToTerms = parseBool(json['agreesToTerms']) ?? false;
    autoPublish = json['autoPublish'] ?? 0;
    callKitPushToken = json['callKitPushToken'] ?? "";
    creditsRemaining = parseDouble(json['creditsRemaining']);
    email = json['email'];
    isOnTrial = parseBool(json['isOnTrial']) ?? false;
    name = json['name'] ?? "";
    plan = json['plan'] ?? "";
    trialDeclined = parseBool(json['trialDeclined']) ?? false;
    trialUsed = parseBool(json['trialUsed']) ?? false;
    understandsPublishCommitment = parseBool(json['understandsPublishCommitment']);
    userName = json['userName'];
    temporaryChatPopupShown = parseBool(json['temporaryChatPopupShown']) ?? false;
    notifyListeners();
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'agreesToTerms': agreesToTerms,
      'autoPublish': autoPublish,
      'callKitPushToken': callKitPushToken,
      'creditsRemaining': creditsRemaining,
      'email': email,
      'isOnTrial': isOnTrial,
      'name': name,
      'plan': plan,
      'trialDeclined': trialDeclined,
      'trialUsed': trialUsed,
      'understandsPublishCommitment': understandsPublishCommitment,
      'userName': userName,
      'temporaryChatPopupShown': temporaryChatPopupShown,
    };
  }

  void setValues(AuthenticatedUser newAuthenticatedUser) {
    var map = newAuthenticatedUser.toMap();
    applyMapValues(map);
    notifyListeners();
  }
}