import { DbObject } from "../lib/db";


export class AuthenticatedUserProfilePicture extends DbObject {
    authenticatedUser: number;
    pictureGuid: string;
    nsfwResult: boolean;
    uploaded: boolean;
    checkedForNsfw: boolean;
}