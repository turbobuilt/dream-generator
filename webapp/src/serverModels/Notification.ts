export class Notification {
    authenticatedUser?: number;
    chatMessage?: number;
    authenticatedUserFriend?: number;
    eventDateTime?: number;
    originatorPictureGuid?: string;
    originatorUserName?: string;

    typename() {
        return 'Notification';
    }
}
