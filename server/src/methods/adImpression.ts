import { AdImpression } from "../models/AdImpression";


export async function adImpression(req, res) {
    let { type, adUnitId } = req.body;
    let adImpression = new AdImpression({ authenticatedUser: req.authenticatedUser.id, type, adUnitId });
    await adImpression.save();
    return res.json({ success: true });
}


export const route = {
    url: "/api/ad-impression",
    method: 'POST',
    authenticated: true,
};