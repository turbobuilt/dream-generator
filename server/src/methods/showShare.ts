
import { Request, Response } from "express";
import Handlebars from "handlebars";
import * as fs from "fs";
const template = Handlebars.compile(fs.readFileSync(__dirname.replace("/build.nosync/", "/src/") + '/../templates/share.hbs', 'utf8'));


export async function showShare(req: Request, res: Response): Promise<any> {
    let { id } = req.params;

    if (!id) {
        return res.status(400).send({ message: "ID is required" });
    }

    let query = `SELECT Share.*, Prompt.text, AuthenticatedUser.userName, SharedImage.path AS imagePath, SharedImage.webp as webp 
    FROM Share 
    LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id 
    LEFT JOIN Prompt ON Share.prompt = Prompt.id
    LEFT JOIN AuthenticatedUser on Share.authenticatedUser = AuthenticatedUser.id
    WHERE Share.id = ?`;

    let [[share]] = await global.db.query(query, [id]);

    if (!share) {
        return res.status(404).send({ message: "Share not found" });
    }
    let imageUrl = `https://images.dreamgenerator.ai/${share.imagePath}`;
    let twitterUrl = imageUrl
    if (share.webp) {
        twitterUrl = imageUrl.replace(".avif", ".webp");
        imageUrl = twitterUrl;
    }
    return res.send(template({ ...share, imageUrl, twitterUrl }));
    // return res.send(html);
}


export const route = {
    url: "/share/:id",
    method: 'GET',
    authenticated: false
};