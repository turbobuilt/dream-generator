import { Request, Response } from 'express';

export async function getNotifications(req: Request, res: Response, { page, perPage }) {
    let [items] = await db.query(`SELECT Notification.*,
            FriendUser.userName as friendUserName,
            FriendProfilePicture.pictureGuid as friendPictureGuid,
            ChatMessageText.text as chatMessageText,
            ChatSenderProfilePicture.pictureGuid as originatorPictureGuid,
            ChatSender.userName as originatorUserName
        FROM Notification
        LEFT JOIN AuthenticatedUserFriend ON AuthenticatedUserFriend.id = Notification.authenticatedUserFriend
        LEFT JOIN AuthenticatedUser as FriendUser ON FriendUser.id = AuthenticatedUserFriend.authenticatedUser
        LEFT JOIN AuthenticatedUserProfilePicture as FriendProfilePicture ON FriendProfilePicture.authenticatedUser = FriendUser.id
        LEFT JOIN ChatMessage ON ChatMessage.id = Notification.chatMessage
        LEFT JOIN ChatMessageText ON ChatMessageText.chatMessage = ChatMessage.id
        LEFT JOIN AuthenticatedUser as ChatSender ON ChatSender.id = ChatMessage.authenticatedUser
        LEFT JOIN AuthenticatedUserProfilePicture as ChatSenderProfilePicture ON ChatSenderProfilePicture.authenticatedUser = ChatMessage.authenticatedUser
        WHERE Notification.authenticatedUser = ?
        ORDER BY Notification.created DESC
        LIMIT ? OFFSET ?`, [req.authenticatedUser.id, perPage, perPage * (page-1)]);
    return { items };
}