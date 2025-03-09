import Handlebars from "handlebars";
import * as fs from "fs";

const template = Handlebars.compile(fs.readFileSync(__dirname.replace("/build.nosync/", "/src/") + '/../templates/feed.hbs', 'utf8'));
// let compiled = Handlebars.template(Handlebars.precompile(template));
export async function publicFeedPage(req, res) {
    let items = await getWebsiteFeedItems(req);
    res.send(template({ items, last: items[items.length - 1]?.id }))
}

export async function getWebsiteFeedItems(req) {
    let { last } = req.query;
    console.log(req.query);

    let perPage = 20;
    if (last)
        last = parseInt(last) || null;
    
    let [items] = await global.db.query(`
            SELECT items.*
            FROM (
                SELECT Share.id as id, Prompt.text, Prompt.style, Prompt.id as promptId, MIN(SharedImage.path) AS imagePath, COUNT(ShareLike.id) as likesCount, AuthenticatedUser.userName, AuthenticatedUser.id as userId
                FROM Share
                LEFT JOIN Prompt ON Share.prompt = Prompt.id
                LEFT JOIN SharedImage ON Share.sharedImage = SharedImage.id
                LEFT JOIN ShareLike ON Share.id = ShareLike.share
                LEFT JOIN AuthenticatedUser ON Share.authenticatedUser = AuthenticatedUser.id
                WHERE Share.parent IS NULL 
                    AND Share.sharedImage IS NOT NULL  AND SharedImage.uploaded = 1
                    ${last ? `AND Share.id < ${last}` : ""}
                    ${req.authenticatedUser?.expandedContent ? "" : "AND SharedImage.nudity <> 1"}
                GROUP BY Share.id, Prompt.id, Share.authenticatedUser
                ORDER BY Share.created DESC
                LIMIT ?
            ) as items
    `, [perPage]) as any[];
    return items
}


export const route = {
    url: "/feed",
    method: 'GET',
    authenticated: false,
}