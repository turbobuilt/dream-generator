import { getWebsiteFeedItems } from "./publicFeedPage";

export async function publicFeedLoadMore(req, res) {
    let items = await getWebsiteFeedItems(req);
    return res.send({ items });
}

export const route = {
    url: "/load-more-feed",
    method: 'GET',
    authenticated: false,
}