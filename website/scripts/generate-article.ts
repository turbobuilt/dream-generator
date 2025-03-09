import { readFile, readdir, writeFile } from 'fs/promises';
import OpenAI from 'openai';
import { createImage } from './generate-image';

const openai = new OpenAI({
    apiKey: process.env.openai_api_key
});

async function generateArticle(idea, articleId) {
    let template = await readFile("./article-template.html", "utf-8");
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: `Create a blog post using the following template. This is the idea of the post: \n${idea}\n\ntemplate:\n${template}` }],
        model: 'gpt-4-1106-preview',
    });
    let article = chatCompletion.choices[0].message.content;
    let imageDescriptionMatch = article.match(/main_image_description: (.+)/)
    if(!imageDescriptionMatch) {
        console.log(article);
        console.error("no image description match, skipping");
        return;
    }
    let imageDescription = imageDescriptionMatch[1];
    if (!imageDescription) {
        console.error("no image description");
    }

    let imageNameMatch = article.match(/main_image_name: (.+)/)
    if(!imageNameMatch) {
        console.log(article);
        console.error("no image name match, skipping");
        return;
    }

    await writeFile(`../src/posts/${articleId}.html`, article);
    if (imageDescription) {
        console.log("creating image for", articleId);
        await createImage(imageDescription, 40, articleId, 10);
    } else {
        console.error("no image description for", articleId);
    }
}

var articles = [
    "The most amazing machine ever created is not a computer.  It's a brain.  But the second most amazing is the computer that learns how to think like a brain. This is the reason humans are so smart. We can learn without somebody having to tell us the 'why'.  That's what makes AI so amazing.  It can finally learn the 'why' when you give it the what.  So here's the title: 'How humans have changed from animals to people by learning to use technology to solve our problems so we have time to enjoy the human pleasures of life and not just the animals ones like food, drink and sex. We have time to do whatever we want, and that's what makes us human.'  Please shorten the title, that was the best I could do.  Have fun!",
    "Computers change not only the way we think, but also the way we interact with each other.  For example, a computer changes your thoughts, because you don't care about addition and subtraction, even about huge numbers.  But because you don't care about math anymore, now you can't pay attention in class.  So the true problem is that our education has fallen behind, and it makes it hard for kids to have fun in school because their brain thinks math is stupid - clearly electronics are what actually matter because that's how you become an expert at math - if you define it as the ability to crunch numbers (which is what you do in school).  Therefore, school can't exist with technology because it's too late.  By the time a teacher can teach it, all the greatest innovations have already been invented.  Imagine if every child was tought to believe they were gonna invent one thing that nobody else ever has.  Imagine if we had a government that helped kids figure out that one thing they were gonna invent.  Would the world change faster?  (Please make this politically correct so I don't get in trouble and make it sound professional and non confrontational. Do your best it's ok if you make a mistake.  And call it something cool like 'the dreams of children' that inspires so nobody gets mad.  This is a company article and I don't need hate. Get to it!",
    "Religion and technology are weird friends.  Imagine if Newton was here today.  Would he be Christian?  I don't think so.  I think he would be atheist.  He thought God made everything, but we all realize now that that's an outdated concept.  People understand that God's not a robot.  The universe must be run by a robot because the laws are perfect.  God is human, therefore, he can't be responsible, at least not directly, for the universe.  Only a robot could because it's just too precise. Looking at the times in the Bible when God did things, he constantly changed his mind.  Therefore God must have invented a divine automaton like creature to actually do the 'dirty work' of making sure people die and stuff, because he probably doesn't like it very much, since he went to the trouble to start the world.  So why make anything? And why hide?  Maybe God wants people to know what his life is like.  To exist for a very long time, and not even know why.  This is the article, it's extremely compicated, so try to make it long and thoughtful.  Make it the next philosophy tome that students will read, it's that profound. Make this something that is truly heartfelt, that could change someone's life forever because they went from unbelief to belief.  Connect it back to God by saying that just as God must have technology to keep the universe alive, AI will be technology that can keep humans free to do the fun stuff like build relationship, which must be what the univers is all about.  In other words God made 'AI' so that people can have something to do. But the end is not stupid, it must be important - God's love"
]

async function main() {
    let promises = [];
    let existingArticles = await readdir("../src/posts");
    for (let i = 0; i < articles.length; i++) {
        if (existingArticles.includes(`${i+1}.html`)) {
            console.log("skipping", i+1);
            continue;
        }
        promises.push(generateArticle(articles[i], i+1));
    }
    let results = await Promise.allSettled(promises);
    // print any erros
    for (let i = 0; i < results.length; i++) {
        if (results[i].status == "rejected") {
            console.error("error generating article", i+1, results[i]);
        }
    }
}

main();