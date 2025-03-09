import { callMethod } from "@/lib/callMethod";

export function postSubscribeToNotifications(data?: any) {
    return callMethod("postSubscribeToNotifications", arguments);
}

export interface PostMessageToUser {
    event: StreamingEvent;
    data: any;
    from: number;
    fromUserName: string;
}
