import { DbObject } from "../lib/db";

export async function getVideoCallLink(videoCallId: number, authenticatedUserId: number) {
    let [authenticatedUsers] = await db.query(`SELECT AuthenticatedUser.userName, ChatMessageVideoCall.slug, ChatMessageVideoCall.id
        FROM AuthenticatedUser
        JOIN ChatMessageTarget ON ChatMessageTarget.authenticatedUser = AuthenticatedUser.id
        JOIN ChatMessage ON ChatMessage.id = ChatMessageTarget.chatMessage
        JOIN ChatMessageVideoCall ON ChatMessageVideoCall.chatMessage = ChatMessage.id
        WHERE ChatMessageVideoCall.id = ? AND AuthenticatedUser.id IN (?)`, [videoCallId, authenticatedUserId]);
    
    let links = authenticatedUsers.map((user) => {
        return `https://meet.jit.si/${user.slug}#userInfo.displayName=${user.userName}&config.prejoinConfig.enabled=false`;
    });
    
    return links[0];
}
export function getVideoCallLinkSync(videoCallSlug: number, userName: string) {
    return `https://meet.jit.si/${videoCallSlug}#userInfo.displayName=${userName}&config.prejoinConfig.enabled=false`;
}

export class ChatMessageVideoCall extends DbObject {
    chatMessage?: number;
    slug?: string;
}