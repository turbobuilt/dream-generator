import { updateSharedImage } from "./serverMethods/updateSharedImage";
import { postUserProfilePicture } from "./serverMethods/postUserProfilePicture";
import { updateShareComment } from "./serverMethods/updateShareComment";
import postSubscribeToken from "./serverMethods/postSubscribeToken";
import getManageSubscriptionStripeLink from "./serverMethods/getManageSubscriptionStripeLink";
import { oauthLogin } from "./serverMethods/oauthLogin";
import { getAdminShares } from "./serverMethods/getAdminShares";
import { getMoreCredits } from "./serverMethods/getMoreCredits";
import { getPlans } from "./serverMethods/getPlans";
import { deleteShareComment } from "./serverMethods/deleteShareComment";
import { getAutomailerEmail } from "./serverMethods/getAutomailerEmail";
import deleteAutomailer from "./serverMethods/deleteAutomailer";
import postVerifyEmail from "./serverMethods/postVerifyEmail";
import { authenticateUser } from "./serverMethods/authenticateUser";
import { tryAuthenticateUser } from "./serverMethods/authenticateUser";
import { clientVerifyIosTransaction } from "./serverMethods/clientVerifyIosTransaction";
import { deleteShare } from "./serverMethods/deleteShare";
import postAiChat from "./serverMethods/postAiChat";
import { androidTransactionWebhook } from "./serverMethods/androidTransactionWebhook";
import { getShareChildren } from "./serverMethods/getShareChildren";
import { getShare } from "./serverMethods/getShare";
import { clientVerifyAndroidTransaction } from "./serverMethods/clientVerifyAndroidTransaction";
import { stripeWebhook } from "./serverMethods/stripeWebhook";
import { getMyProfile } from "./serverMethods/getMyProfile";
import { showShare } from "./serverMethods/showShare";
import { createTwitterToken } from "./serverMethods/createTwitterToken";
import { unlikeShare } from "./serverMethods/unlikeShare";
import { getMyPromptLikes } from "./serverMethods/getMyPromptLikes";
import { shareAllContacts } from "./serverMethods/shareAllContacts";
import { cancelStripeSubscription } from "./serverMethods/cancelStripeSubscription";
import { publishPrompt } from "./serverMethods/publishPrompt";
import { reportObjectionableContent } from "./serverMethods/reportObjectionableContent";
import captureStripeSubscription from "./serverMethods/captureStripeSubscription";
import getChatModels from "./serverMethods/getChatModels";
import { getAutomailer } from "./serverMethods/getAutomailer";
import { postGetSharedEmails } from "./serverMethods/postGetSharedEmails";
import getVerifyEmail from "./serverMethods/getVerifyEmail";
import postSubscribeEmailPayment from "./serverMethods/postSubscribeEmailPayment";
import { updateGenerationProgress } from "./serverMethods/updateGenerationProgress";
import getAppPlans from "./serverMethods/getAppPlans";
import { publicFeedPage } from "./serverMethods/publicFeedPage";
import { submitImageModifyWithPrompt } from "./serverMethods/submitImageModifyWithPrompt";
import modalUpdateStatus from "./serverMethods/modalUpdateStatus";
import getCreditPackPaymentIntent from "./serverMethods/getCreditPackPaymentIntent";
import deleteAutomailerEmail from "./serverMethods/deleteAutomailerEmail";
import { pollImageStatus } from "./serverMethods/pollImageStatus";
import { updateNudity } from "./serverMethods/updateNudity";
import { userAgreesToTerms } from "./serverMethods/userAgreesToTerms";
import { myShares } from "./serverMethods/myShares";
import { likePrompt } from "./serverMethods/likePrompt";
import { putToggleSharedImageSexualContent } from "./serverMethods/putToggleSharedImageSexualContent";
import { getPrompt } from "./serverMethods/getPrompt";
import { getAutomailers } from "./serverMethods/getAutomailers";
import { updateOnlineStatus } from "./serverMethods/updateOnlineStatus";
import { getPromptsForUser } from "./serverMethods/getPromptsForUser";
import { unlikePrompt } from "./serverMethods/unlikePrompt";
import { adImpression } from "./serverMethods/adImpression";
import postNewCreateImage from "./serverMethods/newCreateImage";
import { postGetPromptStatus } from "./serverMethods/postGetPromptStatus";
import { getAuthenticatedUser } from "./serverMethods/getAuthenticatedUser";
import postAutomailerEmail from "./serverMethods/postAutomailerEmail";
import { twitterCallback } from "./serverMethods/twitterCallback";
import { updateCloudSync } from "./serverMethods/updateCloudSync";
import { createShareCommentLike } from "./serverMethods/createShareCommentLike";
import { leftReview } from "./serverMethods/leftReview";
import { getPromptCategories } from "./serverMethods/getPromptCategories";
import { createAnonymousAccount } from "./serverMethods/createAnonymousAccount";
import getCheckIfShareExists from "./serverMethods/getCheckIfShareExists";
import { submitImageGenerateWithPrompt } from "./serverMethods/submitImageGenerateWithPrompt";
import { setName } from "./serverMethods/setName";
import { deleteShareCommentLike } from "./serverMethods/deleteShareCommentLike";
import { sendShareEmail } from "./serverMethods/sendShareEmail";
import { likeShare } from "./serverMethods/likeShare";
import getPollVerifyEmail from "./serverMethods/getPollVerifyEmail";
import { createShare } from "./serverMethods/createShare";
import { getCreditsRemaining } from "./serverMethods/getCreditsRemaining";
import { handleAppStoreServerNotification } from "./serverMethods/handleAppStoreServerNotification";
import testMethod from "./serverMethods/testMethod";
import { getFeedItems } from "./serverMethods/getFeedItems";
import { saveShareEmail } from "./serverMethods/saveShareEmail";
import { verifyStripeCreditPackPayment } from "./serverMethods/verifyStripePayment";
import { verifyStripePayment } from "./serverMethods/verifyStripePayment";
import { postBlockAuthenticatedUser } from "./serverMethods/postBlockAuthenticatedUser";
import { getSubscriptionStatus } from "./serverMethods/getSubscriptionStatus";
import postCreateAccountEmail from "./serverMethods/postCreateAccountEmail";
import { getShareEmail } from "./serverMethods/getShareEmail";
import { getStripeStatus } from "./serverMethods/getStripeStatus";
import getStripeCustomerPortalLink from "./serverMethods/getStripeCustomerPortalLink";
import postEmailLoginToken from "./serverMethods/postEmailLoginToken";
import { saveUserName } from "./serverMethods/saveUserName";
import getCreditPacksList from "./serverMethods/getCreditPacksList";
import getSendLoginWithEmail from "./serverMethods/getSendLoginWithEmail";
import { fetchAuthenticatedUser } from "./serverMethods/fetchAuthenticatedUser";
import { getPromptsByCategory } from "./serverMethods/getPromptsByCategory";
import { toggleShareFeatured } from "./serverMethods/toggleShareFeatured";
import { publicFeed } from "./serverMethods/publicFeed";
import { getDeleteAccount } from "./serverMethods/getDeleteAccount";
import { saveShareComment } from "./serverMethods/saveShareComment";
import { postAddFriend } from "./serverMethods/postAddFriend";
import getCreateImageModels from "./serverMethods/getCreateImageModels";
import getPollLoginEmail from "./serverMethods/getPollLoginEmail";
import postRemoveFriend from "./serverMethods/postRemoveFriend";
import postAutomailer from "./serverMethods/postAutomailer";
import { createPaymentIntent } from "./serverMethods/createPaymentIntent";
import { publicFeedLoadMore } from "./serverMethods/publicFeedLoadMore";
import { saveUserData } from "./serverMethods/saveUserData";
import { pollImageStatusMany } from "./serverMethods/pollImageStatusMany";
import { checkUserName } from "./serverMethods/checkUserName";
import getUserLikes from "./serverMethods/getUserLikes";
import { getUserProfile } from "./serverMethods/getUserProfile";
import { authenticateUserInternal } from "./serverMethods/authenticateUser";
import { getChangePlanPricingStripe } from "./serverMethods/getChangePlanPricingStripe";
import { changePlanStripe } from "./serverMethods/changePlanStripe";
import { downgradePlan } from "./serverMethods/downgradePlan";
import { getStartImageUpscaleUpload } from "./serverMethods/getStartImageUpscaleUpload";
import { submitImageUpscaleWithPrompt } from "./serverMethods/submitImageUpscale";
import { postSubmitImageUpscale } from "./serverMethods/postSubmitImageUpscale";
import { postSubmitRemoveImageBackground } from "./serverMethods/postSubmitRemoveImageBackground";
import { cancelStripePlan } from "./serverMethods/cancelStripePlan";
import { getUserShares } from "./serverMethods/getUserShares";
import { getMyFriends } from "./serverMethods/getMyFriends";
import { postSubmitAppleWebLogin } from "./serverMethods/postSubmitAppleWebLogin";
import { postMicrosoftLogin } from "./serverMethods/postMicrosoftLogin";
import { getChatMessages } from "./serverMethods/getChatMessages";
import { getImageModels } from "./serverMethods/getImageModels";
import { postCreateOrganization } from "./serverMethods/postCreateOrganization";
import { postAddUserToOrganization } from "./serverMethods/postAddUserToOrganization";
import { getSubscribeToNotifications } from "./serverMethods/getSubscribeToNotifications";
import { postMicrosoftGrant } from "./serverMethods/postMicrosoftGrant";
import { getMicrosoftUsers } from "./serverMethods/getMicrosoftUsers";
import { postSubscribeToNotifications } from "./serverMethods/postSubscribeToNotifications";
import { postSendRtcAnswer } from "./serverMethods/postSendRtcAnswer";
import { postManageCallRoom } from "./serverMethods/postManageCallRoom";
import { postCallRoomAnswer } from "./serverMethods/postCallRoomAnswer";
import { postOnIceCandidate } from "./serverMethods/postOnIceCandidate";
import { postIceCandidate } from "./serverMethods/postIceCandidate";
import { postRejectVideoChat } from "./serverMethods/postRejectVideoChat";
import { postSetCallKitPushToken } from "./serverMethods/postSetCallKitPushToken";
import { postRejectVideoCall } from "./serverMethods/postRejectVideoCall";
import { postEndVideoChat } from "./serverMethods/postEndVideoChat";
import { postCheckIfUserIsAvailableForVideo } from "./serverMethods/postCheckIfUserIsAvailableForVideo";
import { postSearchPeople } from "./serverMethods/postSearchPeople";
import { getNotifications } from "./serverMethods/getNotifications";
import { postGenerateAudio } from "./serverMethods/postGenerateAudio";
import { startAnimateVideoTask } from "./serverMethods/startAnimateVideoTask";
import { getAnimateVideoUploadLink } from "./serverMethods/getAnimateVideoUploadLink";
import { postSubmitTextChatMessage } from "./serverMethods/postSubmitTextChatMessage";
import { postUpdateTemporaryChatPopupShown } from "./serverMethods/postUpdateTemporaryChatPopupShown";
import { postFetchChatMessageContent } from "./serverMethods/postFetchChatMessageContent";
import { postMarkChatMessageTargetRead } from "./serverMethods/postMarkChatMessageTargetRead";
import { postCreateVideoCall } from "./serverMethods/postCreateVideoCall";
import { postVideoChatSdpOffer } from "./serverMethods/postVideoChatSdpOffer";
import { postVideoChatSdpAnswer } from "./serverMethods/postVideoChatSdpAnswer";
import { postCreateCallRoom } from "./serverMethods/postCreateCallRoom";
import { publishAudio } from "./serverMethods/publishAudio";
import { updateSharedAudio } from "./serverMethods/updateSharedAudio";
import { generateTextToSpeech } from "./serverMethods/generateTextToSpeech";
import { getTextToSpeechModels } from "./serverMethods/getTextToSpeechModels";

export const serverMethods = {
    updateSharedImage: updateSharedImage,
    postUserProfilePicture: postUserProfilePicture,
    updateShareComment: updateShareComment,
    postSubscribeToken: postSubscribeToken,
    getManageSubscriptionStripeLink: getManageSubscriptionStripeLink,
    oauthLogin: oauthLogin,
    getAdminShares: getAdminShares,
    getMoreCredits: getMoreCredits,
    getPlans: getPlans,
    deleteShareComment: deleteShareComment,
    getAutomailerEmail: getAutomailerEmail,
    deleteAutomailer: deleteAutomailer,
    postVerifyEmail: postVerifyEmail,
    authenticateUser: authenticateUser,
    tryAuthenticateUser: tryAuthenticateUser,
    clientVerifyIosTransaction: clientVerifyIosTransaction,
    deleteShare: deleteShare,
    postAiChat: postAiChat,
    androidTransactionWebhook: androidTransactionWebhook,
    getShareChildren: getShareChildren,
    getShare: getShare,
    clientVerifyAndroidTransaction: clientVerifyAndroidTransaction,
    stripeWebhook: stripeWebhook,
    getMyProfile: getMyProfile,
    showShare: showShare,
    createTwitterToken: createTwitterToken,
    unlikeShare: unlikeShare,
    getMyPromptLikes: getMyPromptLikes,
    shareAllContacts: shareAllContacts,
    cancelStripeSubscription: cancelStripeSubscription,
    publishPrompt: publishPrompt,
    reportObjectionableContent: reportObjectionableContent,
    captureStripeSubscription: captureStripeSubscription,
    getChatModels: getChatModels,
    getAutomailer: getAutomailer,
    postGetSharedEmails: postGetSharedEmails,
    getVerifyEmail: getVerifyEmail,
    postSubscribeEmailPayment: postSubscribeEmailPayment,
    updateGenerationProgress: updateGenerationProgress,
    getAppPlans: getAppPlans,
    publicFeedPage: publicFeedPage,
    submitImageModifyWithPrompt: submitImageModifyWithPrompt,
    modalUpdateStatus: modalUpdateStatus,
    getCreditPackPaymentIntent: getCreditPackPaymentIntent,
    deleteAutomailerEmail: deleteAutomailerEmail,
    pollImageStatus: pollImageStatus,
    updateNudity: updateNudity,
    userAgreesToTerms: userAgreesToTerms,
    myShares: myShares,
    likePrompt: likePrompt,
    putToggleSharedImageSexualContent: putToggleSharedImageSexualContent,
    getPrompt: getPrompt,
    getAutomailers: getAutomailers,
    updateOnlineStatus: updateOnlineStatus,
    getPromptsForUser: getPromptsForUser,
    unlikePrompt: unlikePrompt,
    adImpression: adImpression,
    postNewCreateImage: postNewCreateImage,
    postGetPromptStatus: postGetPromptStatus,
    getAuthenticatedUser: getAuthenticatedUser,
    postAutomailerEmail: postAutomailerEmail,
    twitterCallback: twitterCallback,
    updateCloudSync: updateCloudSync,
    createShareCommentLike: createShareCommentLike,
    leftReview: leftReview,
    getPromptCategories: getPromptCategories,
    createAnonymousAccount: createAnonymousAccount,
    getCheckIfShareExists: getCheckIfShareExists,
    submitImageGenerateWithPrompt: submitImageGenerateWithPrompt,
    setName: setName,
    deleteShareCommentLike: deleteShareCommentLike,
    sendShareEmail: sendShareEmail,
    likeShare: likeShare,
    getPollVerifyEmail: getPollVerifyEmail,
    createShare: createShare,
    getCreditsRemaining: getCreditsRemaining,
    handleAppStoreServerNotification: handleAppStoreServerNotification,
    testMethod: testMethod,
    getFeedItems: getFeedItems,
    saveShareEmail: saveShareEmail,
    verifyStripeCreditPackPayment: verifyStripeCreditPackPayment,
    verifyStripePayment: verifyStripePayment,
    postBlockAuthenticatedUser: postBlockAuthenticatedUser,
    getSubscriptionStatus: getSubscriptionStatus,
    postCreateAccountEmail: postCreateAccountEmail,
    getShareEmail: getShareEmail,
    getStripeStatus: getStripeStatus,
    getStripeCustomerPortalLink: getStripeCustomerPortalLink,
    postEmailLoginToken: postEmailLoginToken,
    saveUserName: saveUserName,
    getCreditPacksList: getCreditPacksList,
    getSendLoginWithEmail: getSendLoginWithEmail,
    fetchAuthenticatedUser: fetchAuthenticatedUser,
    getPromptsByCategory: getPromptsByCategory,
    toggleShareFeatured: toggleShareFeatured,
    publicFeed: publicFeed,
    getDeleteAccount: getDeleteAccount,
    saveShareComment: saveShareComment,
    postAddFriend: postAddFriend,
    getCreateImageModels: getCreateImageModels,
    getPollLoginEmail: getPollLoginEmail,
    postRemoveFriend: postRemoveFriend,
    postAutomailer: postAutomailer,
    createPaymentIntent: createPaymentIntent,
    publicFeedLoadMore: publicFeedLoadMore,
    saveUserData: saveUserData,
    pollImageStatusMany: pollImageStatusMany,
    checkUserName: checkUserName,
    getUserLikes: getUserLikes,
    getUserProfile: getUserProfile,
    authenticateUserInternal: authenticateUserInternal,
    getChangePlanPricingStripe: getChangePlanPricingStripe,
    changePlanStripe: changePlanStripe,
    downgradePlan: downgradePlan,
    getStartImageUpscaleUpload: getStartImageUpscaleUpload,
    submitImageUpscaleWithPrompt: submitImageUpscaleWithPrompt,
    postSubmitImageUpscale: postSubmitImageUpscale,
    postSubmitRemoveImageBackground: postSubmitRemoveImageBackground,
    cancelStripePlan: cancelStripePlan,
    getUserShares: getUserShares,
    getMyFriends: getMyFriends,
    postSubmitAppleWebLogin: postSubmitAppleWebLogin,
    postMicrosoftLogin: postMicrosoftLogin,
    getChatMessages: getChatMessages,
    getImageModels: getImageModels,
    postCreateOrganization: postCreateOrganization,
    postAddUserToOrganization: postAddUserToOrganization,
    getSubscribeToNotifications: getSubscribeToNotifications,
    postMicrosoftGrant: postMicrosoftGrant,
    getMicrosoftUsers: getMicrosoftUsers,
    postSubscribeToNotifications: postSubscribeToNotifications,
    postSendRtcAnswer: postSendRtcAnswer,
    postManageCallRoom: postManageCallRoom,
    postCallRoomAnswer: postCallRoomAnswer,
    postOnIceCandidate: postOnIceCandidate,
    postIceCandidate: postIceCandidate,
    postRejectVideoChat: postRejectVideoChat,
    postSetCallKitPushToken: postSetCallKitPushToken,
    postRejectVideoCall: postRejectVideoCall,
    postEndVideoChat: postEndVideoChat,
    postCheckIfUserIsAvailableForVideo: postCheckIfUserIsAvailableForVideo,
    postSearchPeople: postSearchPeople,
    getNotifications: getNotifications,
    postGenerateAudio: postGenerateAudio,
    startAnimateVideoTask: startAnimateVideoTask,
    getAnimateVideoUploadLink: getAnimateVideoUploadLink,
    postSubmitTextChatMessage: postSubmitTextChatMessage,
    postUpdateTemporaryChatPopupShown: postUpdateTemporaryChatPopupShown,
    postFetchChatMessageContent: postFetchChatMessageContent,
    postMarkChatMessageTargetRead: postMarkChatMessageTargetRead,
    postCreateVideoCall: postCreateVideoCall,
    postVideoChatSdpOffer: postVideoChatSdpOffer,
    postVideoChatSdpAnswer: postVideoChatSdpAnswer,
    postCreateCallRoom: postCreateCallRoom,
    publishAudio: publishAudio,
    updateSharedAudio: updateSharedAudio,
    generateTextToSpeech: generateTextToSpeech,
    getTextToSpeechModels: getTextToSpeechModels
};
