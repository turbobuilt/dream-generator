// ignore_for_file: prefer_const_constructors

import 'package:dev/helpers/redirect.dart';
import 'package:dev/lib/show_alert.dart';
import 'package:dev/views/account_view.dart';
import 'package:dev/views/advanced_account_view.dart';
import 'package:dev/views/app/global_store.dart';
import 'package:dev/views/chat_page/chat_page.dart';
import 'package:dev/views/display_output_view/display_output_view.dart';
import 'package:dev/views/edit_user_public_profile/edit_user_public_profile.dart';
import 'package:dev/views/in_app_purchase_view/in_app_purchase_view.dart';
import 'package:dev/views/loading/loading.dart';
import 'package:dev/views/upgrade_modal/components/compare_image_quality.dart';
import 'package:dev/views/people_view/people_view.dart';
import 'package:dev/views/prompt_view.dart';
import 'package:dev/views/create_share_view.dart';
import 'package:dev/views/share_view/share_view.dart';
import 'package:dev/views/simple_terms_privacy.dart';
import 'package:dev/views/start_register_modal/start_register_modal.dart';
import 'package:dev/views/terms_and_conditions_view.dart';
import 'package:dev/views/login_page_view/login_page_view.dart';
import 'package:dev/views/main_view/main_view.dart';
import 'package:dev/views/user_public_profile/user_public_profile.dart';
import 'package:dev/views/video_view/components/calling_page.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../views/prompt_category_view.dart';
import '../views/share_credit_view.dart';
import '../views/share_details_view.dart';

// GoRouter configuration
final router = GoRouter(
  initialLocation: "/loading",
  navigatorKey: navigatorKey,
  routes: [
    GoRoute(path: "/loading", name: "loading", builder: (context, state) => LoadingPage()),
    GoRoute(path: "/start-register-modal", name: "startRegisterModal", builder: (context, state) => StartRegisterModal(state.extra)),
    GoRoute(path: "/app-create", builder: (context, state) => Redirect(context, state)),
    GoRoute(path: "/login", builder: (context, state) => LoginPageView()),
    GoRoute(path: "/terms", builder: (context, state) => TermsAndConditionsView()),
    GoRoute(path: '/home', name: "home", builder: (context, state) => MainView()),
    GoRoute(path: "/people", name: "people", builder: (context,state) => PeopleView()),
    GoRoute(path: '/purchase', builder: (context, state) => InAppPurchaseView()),
    GoRoute(path: '/display-result', name: "displayResult", builder: (context, state) => DisplayOutputView()),
    GoRoute(path: '/account', builder: (context, state) => AccountView()),
    GoRoute(path: '/advanced-account', builder: (context, state) => AdvancedAccountView()),
    GoRoute(path: '/create-share', builder: (context, state) => CreateShareView()),
    GoRoute(path: '/share/:id', name: "shareView", builder: (context, state) => ShareView(state.extra)),
    GoRoute(path: '/simple-terms', builder: (context, state) => SimpleTermsView()),
    GoRoute(path: '/simple-privacy', builder: (context, state) => SimplePrivacyView()),
    GoRoute(path: '/prompt-category/:id', builder: (context, state) => PromptCategoryView(state.pathParameters["id"])),
    GoRoute(path: '/prompt/:id', builder: (context, state) => PromptView(state.pathParameters["id"])),
    GoRoute(path: '/share/prompt/:id', builder: (context, state) => PromptView(state.pathParameters["id"])),
    GoRoute(path: '/share-credit', builder: (context, state) => ShareCreditView()),
    GoRoute(path: '/share-details/:id', builder: (context, state) => ShareDetailsView(state.pathParameters["id"])),
    GoRoute(path: '/user-profile/:userName', name:"userPublicProfile", builder: (context, state) => UserPublicProfile(state.pathParameters["userName"]!)),
    GoRoute(path: '/chat', name:"chat", builder: (context, state) => ChatPage(state)),
    // GoRoute(path: '/video-chat', name: "callingPage", builder: (context, state) => CallingPage()),
    GoRoute(path: "/compare-image-quality", name: "compareImageQuality", builder: (context, state) => CompareImageQuality())
  ],
);