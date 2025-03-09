export class AdImpression extends global.DbObject {
    id: number; // The ID of the main feed item
    type: string;
    adUnitId: string;
    authenticatedUser: string;
}