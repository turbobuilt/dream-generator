import { DbObject } from "../lib/db";


export class Share extends DbObject {
    id: number;
    created: number;
    updated: number;
    createdBy: number;
    updatedBy: number;
    authenticatedUser: number;
    sharedImage: number;
    sharedAudio: number;
    parent: number;
    text: string;
    prompt: string;
    postedToFacebook: boolean;
    postedToFacebookBegun: boolean;
    postedToTwitter: boolean;
    twitterId: string;
    facebookId: string;
    featured: boolean;
    instagramPublishStarted: boolean;
    instagramId: string;
    processed: boolean;
}

export type ClientShare = Share & {
    dataUrl: string, 
    userId: number, 
    userName: string, 
    likesCount: number, 
    liked: boolean, 
    children: (Share & { text: string })[]
}