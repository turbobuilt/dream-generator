export class ShareComment extends global.DbObject {
    share: number;
    authenticatedUser: number;
    body: string;
    parent: number;
}