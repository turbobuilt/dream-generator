// typescript

/* 
Step by step plan:

1. Import necessary functions and classes.
2. Export async function "getPromptsByCategory" with req and res parameters.
3. Destructure "promptCategory" from req.query.
4. Validate "promptCategory" to make sure it's a number. If not, send status 400 and error message.
5. Destructure "page, perPage" from req.query and set default values. Validate and parse them to numbers.
6. Use a raw sql query to fetch prompts by category from the database, considering pagination.
7. After the data is fetched, return the items as JSON response.
8. Lastly, export the route details.
*/

import { Request, Response } from 'express';
import moment from 'moment';
import { PromptLike } from '../models/PromptLike';

export async function getPromptsByCategory(req: Request, res: Response): Promise<void> {
  let { category } = req.query;

  // Validate promptCategory
  if(!Number(category)){
    res.status(400).send({error: 'Invalid query parameter: promptCategory'});
    return;
  }

  let page = parseInt(req.query.page as any || 1);
  let perPage = parseInt(req.query.perPage as any || 50);

  // Validation
  if (isNaN(page) || isNaN(perPage)) {
    res.status(400).send({error: 'Invalid query parameters: page and perPage should be numbers'});
    return;
  }

  if (perPage > 50)
    perPage = 50;

  const halfPage = Math.round(perPage/2);

  try {
    await global.db.query("SELECT id FROM PromptLike LIMIT 1");
  } catch {
    let like = new PromptLike({ prompt: 1, authenticatedUser: 1 });
    await like.save();
  }
  
  try {
      // SQL Query to select prompts by category, make sure to select number of Like where Like.prompt = Prompt.id
    const popular = `
    SELECT Prompt.*, COUNT(PromptLike.id) AS likesCount
    FROM Prompt
    LEFT JOIN PromptLike ON PromptLike.prompt = Prompt.id
    WHERE Prompt.promptCategory = ?
    GROUP BY Prompt.id
    ORDER BY likesCount DESC
    LIMIT ?, ?
    `;
    const [popularResults] = await global.db.query(popular, [category, (page-1)*halfPage, halfPage]);
    let ids = [];
    for(let result of popularResults)
        ids.push(result.id);
    let unpopularResults = [];
    if(ids.length) {
        // query for halfPage random prompts that are not in ids, including number of likes
        [unpopularResults] = await global.db.query(`
        SELECT Prompt.*, COUNT(PromptLike.id) AS likesCount
        FROM Prompt
        LEFT JOIN PromptLike ON PromptLike.prompt = Prompt.id
        WHERE Prompt.promptCategory = ? AND Prompt.id NOT IN (?)
        GROUP BY Prompt.id
        ORDER BY Prompt.created > ?, RAND()
        LIMIT ?
        `, [category, ids, moment().subtract(48, "hours").toDate().getTime(), Math.round(halfPage)]);
        console.log(ids, unpopularResults)
    }
    // interleave the results
    let results = [];
    for(let i = 0; i < Math.max(popularResults.length, unpopularResults.length); ++i) {
        if(popularResults[i])
            results.push(popularResults[i]);
        if(unpopularResults[i])
            results.push(unpopularResults[i]);
    }
    res.send({ items: results });
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'Error retrieving data from database'});
  }
}

export const route = {
    url: "/api/prompt",
    method: 'GET',
    authenticated: true,
};
