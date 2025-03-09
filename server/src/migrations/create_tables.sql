-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: dreamgenerator
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.22.04.1

--
-- Table structure for table `AdImpression`
--

SET FOREIGN_KEY_CHECKS=0;


CREATE TABLE `AdImpression` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `adUnitId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `AdImpression_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL
) ;



CREATE TABLE AiChatRequest (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `inputTokenCount` bigint DEFAULT NULL,
  `creditCost` float DEFAULT NULL,
  `outputTokenCount` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `AiChatRequest_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `AuthToken`
--




CREATE TABLE `AuthToken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_AuthToken_authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `fk_AuthToken_authenticatedUser` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`)
) ;


--
-- Table structure for table `AuthenticatedUser`
--




CREATE TABLE `AuthenticatedUser` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `providerData` json DEFAULT NULL,
  `passwordHash` varchar(255) DEFAULT NULL,
  `creditsRemaining` float DEFAULT '0',
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `appleIdentifier` varchar(255) DEFAULT NULL,
  `agreesToTerms` tinyint(1) DEFAULT NULL,
  `plan` varchar(255) DEFAULT NULL,
  `understandsPublishCommitment` tinyint DEFAULT NULL,
  `pushToken` varchar(255) DEFAULT NULL,
  `autoPublish` tinyint(1) DEFAULT '0',
  `userName` varchar(100) DEFAULT NULL,
  `shareEmail` text,
  `expandedContent` tinyint(1) DEFAULT NULL,
  `stripeId` varchar(255) DEFAULT NULL,
  `signupPlatform` varchar(255) DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `appleId` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `cloudSync` tinyint(1) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT NULL,
  `contactsShared` tinyint(1) DEFAULT NULL,
  `freeCreditsRoundTwo` tinyint(1) DEFAULT '0',
  `freeCreditsRoundThree` tinyint(1) DEFAULT '0',
  `facebookId` varchar(255) DEFAULT NULL,
  `facebookData` json DEFAULT NULL,
  `trialUsed` tinyint(1) DEFAULT '0',
  `isOnTrial` tinyint(1) DEFAULT '0',
  `trialDeclined` tinyint(1) DEFAULT '0',
  `emailVerified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName` (`userName`),
  KEY `stripeId` (`stripeId`),
  KEY `googleId` (`googleId`),
  KEY `appleId` (`appleId`)
) ;


--
-- Table structure for table `AuthenticatedUserFriend`
--




CREATE TABLE `AuthenticatedUserFriend` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `friend` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `authenticatedUser` (`authenticatedUser`,`friend`),
  KEY `friend` (`friend`),
  CONSTRAINT `AuthenticatedUserFriend_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE,
  CONSTRAINT `AuthenticatedUserFriend_ibfk_2` FOREIGN KEY (`friend`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `AuthenticatedUserProfile`
--




CREATE TABLE `AuthenticatedUserProfile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `bio` varchar(5000) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `pictureUploaded` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `AuthenticatedUserProfile_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `Automailer`
--




CREATE TABLE `Automailer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;


--
-- Table structure for table `AutomailerEmail`
--




CREATE TABLE `AutomailerEmail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `automailer` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text,
  PRIMARY KEY (`id`),
  KEY `automailer` (`automailer`),
  CONSTRAINT `AutomailerEmail_ibfk_1` FOREIGN KEY (`automailer`) REFERENCES `Automailer` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `BlockedAuthenticatedUser`
--




CREATE TABLE `BlockedAuthenticatedUser` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `blockingAuthenticatedUser` bigint DEFAULT NULL,
  `blockedAuthenticatedUser` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blockingAuthenticatedUser` (`blockingAuthenticatedUser`,`blockedAuthenticatedUser`),
  KEY `blockedAuthenticatedUser` (`blockedAuthenticatedUser`),
  CONSTRAINT `BlockedAuthenticatedUser_ibfk_1` FOREIGN KEY (`blockingAuthenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE,
  CONSTRAINT `BlockedAuthenticatedUser_ibfk_2` FOREIGN KEY (`blockedAuthenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `CreditLog`
--




CREATE TABLE `CreditLog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `credits` bigint DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `CreditLog_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `EmailLog`
--




CREATE TABLE `EmailLog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `automailerEmail` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `automailerEmail` (`automailerEmail`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `EmailLog_ibfk_1` FOREIGN KEY (`automailerEmail`) REFERENCES `AutomailerEmail` (`id`) ON DELETE SET NULL,
  CONSTRAINT `EmailLog_ibfk_2` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `EmailLogin`
--




CREATE TABLE `EmailLogin` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `insecureToken` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  KEY `token` (`token`),
  KEY `insecureToken` (`insecureToken`),
  CONSTRAINT `EmailLogin_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `EmailVerification`
--




CREATE TABLE `EmailVerification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  KEY `token` (`token`),
  CONSTRAINT `EmailVerification_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `FreeCredit`
--




CREATE TABLE `FreeCredit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `credits` bigint DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`,`type`,`created`),
  KEY `share` (`share`),
  CONSTRAINT `FreeCredit_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FreeCredit_ibfk_2` FOREIGN KEY (`share`) REFERENCES `Share` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `ImageGenerationRequest`
--




CREATE TABLE `ImageGenerationRequest` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `steps` bigint DEFAULT NULL,
  `taskId` text,
  `status` varchar(255) DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `outputUrl` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `authenticatedUser` bigint DEFAULT NULL,
  `nsfw` tinyint(1) DEFAULT NULL,
  `charged` tinyint DEFAULT NULL,
  `error` varchar(255) DEFAULT NULL,
  `gptResponse` varchar(255) DEFAULT NULL,
  `prompt` bigint DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `isFree` tinyint(1) DEFAULT NULL,
  `progress` float DEFAULT NULL,
  `numSteps` int DEFAULT NULL,
  `negativePrompt` text,
  `aspectRatio` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ImageGenerationRequest_authenticatedUser` (`authenticatedUser`),
  KEY `fk_ImageGenerationRequest_prompt` (`prompt`),
  KEY `outputUrl` (`outputUrl`(5)),
  CONSTRAINT `fk_ImageGenerationRequest_authenticatedUser` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`),
  CONSTRAINT `fk_ImageGenerationRequest_prompt` FOREIGN KEY (`prompt`) REFERENCES `Prompt` (`id`),
  CONSTRAINT `ImageGenerationRequest_FK` FOREIGN KEY (`prompt`) REFERENCES `Prompt` (`id`)
) ;


--
-- Table structure for table `Notification`
--




CREATE TABLE `Notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `authenticatedUser` bigint DEFAULT NULL,
  `type` bigint DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Notification_authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `fk_Notification_authenticatedUser` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`)
) ;


--
-- Table structure for table `ObjectionableContentReport`
--




CREATE TABLE `ObjectionableContentReport` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  KEY `share` (`share`),
  CONSTRAINT `ObjectionableContentReport_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ObjectionableContentReport_ibfk_2` FOREIGN KEY (`share`) REFERENCES `Share` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `Payment`
--




CREATE TABLE `Payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `iosTransactionId` varchar(255) DEFAULT NULL,
  `productId` varchar(255) DEFAULT NULL,
  `credits` bigint DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `androidOrderId` varchar(255) DEFAULT NULL,
  `androidToken` text,
  `authenticatedUser` bigint DEFAULT NULL,
  `originalIosTransactionId` varchar(256) DEFAULT NULL,
  `webOrderLineItemIdIos` varchar(256) DEFAULT NULL,
  `purchaseDateIos` bigint DEFAULT NULL,
  `expiresDateApple` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`)
) ;


--
-- Table structure for table `PopularityFeed`
--




CREATE TABLE `PopularityFeed` (
  `created` bigint DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  `position` bigint DEFAULT NULL,
  KEY `share` (`share`),
  KEY `position` (`position`),
  CONSTRAINT `PopularityFeed_ibfk_1` FOREIGN KEY (`share`) REFERENCES `Share` (`id`)
) ;


--
-- Table structure for table `Prompt`
--




CREATE TABLE `Prompt` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `promptCategory` bigint DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `style` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `uploaded` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Prompt_promptCategory` (`promptCategory`),
  KEY `fk_Prompt_authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `fk_Prompt_authenticatedUser` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`),
  CONSTRAINT `fk_Prompt_promptCategory` FOREIGN KEY (`promptCategory`) REFERENCES `PromptCategory` (`id`)
) ;


--
-- Table structure for table `PromptCategory`
--




CREATE TABLE `PromptCategory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;


--
-- Table structure for table `PromptLike`
--




CREATE TABLE `PromptLike` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `prompt` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `PromptLike_FK` (`prompt`),
  KEY `PromptLike_FK_1` (`authenticatedUser`),
  CONSTRAINT `PromptLike_FK` FOREIGN KEY (`prompt`) REFERENCES `Prompt` (`id`),
  CONSTRAINT `PromptLike_FK_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `Review`
--




CREATE TABLE `Review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `Review_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `Share`
--




CREATE TABLE `Share` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `sharedImage` bigint DEFAULT NULL,
  `parent` bigint DEFAULT NULL,
  `text` text,
  `prompt` bigint DEFAULT NULL,
  `postedToFacebook` tinyint(1) DEFAULT NULL,
  `postedToFacebookBegun` tinyint(1) DEFAULT NULL,
  `postedToTwitter` tinyint(1) DEFAULT NULL,
  `twitterId` varchar(255) DEFAULT NULL,
  `facebookId` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `instagramPublishStarted` tinyint(1) DEFAULT '0',
  `instagramId` varchar(255) DEFAULT NULL,
  `processed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `authenticatedUser` (`authenticatedUser`),
  KEY `parent` (`parent`),
  KEY `sharedImage` (`sharedImage`),
  KEY `Share_FK` (`prompt`),
  CONSTRAINT `Share_FK` FOREIGN KEY (`prompt`) REFERENCES `Prompt` (`id`),
  CONSTRAINT `Share_ibfk_3` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Share_ibfk_4` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Share_ibfk_5` FOREIGN KEY (`parent`) REFERENCES `Share` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Share_ibfk_6` FOREIGN KEY (`sharedImage`) REFERENCES `SharedImage` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `ShareContact`
--




CREATE TABLE `ShareContact` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `ShareContact_ibfk_2` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `ShareLike`
--




CREATE TABLE `ShareLike` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `authenticatedUser` (`authenticatedUser`,`share`),
  KEY `share` (`share`),
  CONSTRAINT `ShareLike_ibfk_2` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`),
  CONSTRAINT `ShareLike_ibfk_3` FOREIGN KEY (`share`) REFERENCES `Share` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `SharedImage`
--




CREATE TABLE `SharedImage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `path` varchar(255) DEFAULT NULL,
  `imageSize` bigint DEFAULT NULL,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `prompt` bigint DEFAULT NULL,
  `uploaded` tinyint DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `nudity` tinyint(1) DEFAULT NULL,
  `webp` tinyint(1) DEFAULT '0',
  `jpg` tinyint(1) DEFAULT '0',
  `sexualContent` tinyint(1) DEFAULT '0',
  `sensitiveContentResult` text,
  `promptNudityDetectionError` text,
  `imageNudityDetectionError` text,
  PRIMARY KEY (`id`),
  KEY `fk_SharedImage_prompt` (`prompt`),
  KEY `model` (`model`),
  KEY `nudity` (`nudity`),
  CONSTRAINT `fk_SharedImage_prompt` FOREIGN KEY (`prompt`) REFERENCES `Prompt` (`id`)
) ;


--
-- Table structure for table `TwitterAuth`
--




CREATE TABLE `TwitterAuth` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codeVerifier` text,
  `refreshToken` text,
  `accessToken` text,
  `state` varchar(255) DEFAULT NULL,
  `expires` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ;


--
-- Table structure for table `TwitterShare`
--




CREATE TABLE `TwitterShare` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` bigint DEFAULT NULL,
  `updated` bigint DEFAULT NULL,
  `createdBy` bigint DEFAULT NULL,
  `updatedBy` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  `tweetId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `share` (`share`),
  CONSTRAINT `TwitterShare_ibfk_1` FOREIGN KEY (`share`) REFERENCES `Share` (`id`) ON DELETE RESTRICT
) ;


--
-- Table structure for table `UserFeedInfo`
--




CREATE TABLE `UserFeedInfo` (
  `authenticatedUser` bigint DEFAULT NULL,
  `globalPopularityFeedPosition` bigint DEFAULT NULL,
  `popularityFeedPosition` bigint DEFAULT NULL,
  KEY `authenticatedUser` (`authenticatedUser`),
  CONSTRAINT `UserFeedInfo_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL
) ;


--
-- Table structure for table `UserMainFeed`
--




CREATE TABLE `UserMainFeed` (
  `created` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  `position` bigint DEFAULT NULL,
  KEY `authenticatedUser` (`authenticatedUser`,`position`),
  KEY `authenticatedUser_2` (`authenticatedUser`,`created`),
  KEY `share` (`share`),
  CONSTRAINT `UserMainFeed_ibfk_1` FOREIGN KEY (`authenticatedUser`) REFERENCES `AuthenticatedUser` (`id`) ON DELETE SET NULL,
  CONSTRAINT `UserMainFeed_ibfk_2` FOREIGN KEY (`share`) REFERENCES `Share` (`id`) ON DELETE CASCADE
) ;


--
-- Table structure for table `UserPopularityFeed`
--




CREATE TABLE `UserPopularityFeed` (
  `created` bigint DEFAULT NULL,
  `authenticatedUser` bigint DEFAULT NULL,
  `share` bigint DEFAULT NULL,
  `position` bigint DEFAULT NULL,
  KEY `share` (`share`),
  KEY `authenticatedUser` (`authenticatedUser`,`position`),
  CONSTRAINT `UserPopularityFeed_ibfk_1` FOREIGN KEY (`share`) REFERENCES `Share` (`id`)
) ;


--
-- Table structure for table `migrations`
--