import { Review } from "../models/Review";

export async function leftReview(req, res) {
    let [[existing]] = await global.db.query("SELECT * FROM Review WHERE AuthenticatedUser=?", [req.authenticatedUser.id]);
    if (!existing) {
        let review = new Review({ authenticatedUser: req.authenticatedUser.id });
        await review.save();
        await global.db.query("UPDATE AuthenticatedUser SET creditsRemaining=creditsRemaining+4 WHERE id=?", [req.authenticatedUser.id]);
    }
    let [[user]] = await global.db.query("SELECT creditsRemaining FROM AuthenticatedUser WHERE id=?", [req.authenticatedUser.id]);
    return res.json({ creditsRemaining: user.creditsRemaining });
}


export const route = { url: "/api/left-review", method: "GET", authenticated: true };