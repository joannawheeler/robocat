import express from "express";
import cors from "cors";
import "core-js/stable";
import "regenerator-runtime/runtime";
import axios from "axios";
// import fs from "fs";
import cheerio from "cheerio";


const app = express();

app.use(cors()).use(express.json());
app.get("/health", (req, res, next) => {
    res.send("OK!");
});

app.post("/findfriends", async (req, res, next) => {
    const website = req.body.website;
    console.log("req: " + req);
    console.log("website: " + website)
    try {
        const friends = await findFriends(website);
        if (!friends) {
            res.send("Sorry man... we didn't find any friends found on " + website + ". " + "I suggest trying another site like https://www.dogshaming.com/!")
        } else {
            res.send(friends);
        }



    } catch (err) {
        console.error("oops", err)

        res.status(500).send({
            sorry: `I'm not very good at finding friends on '${website}'`,
            err: err.message,
            stack: err.stack
        });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`server started ${port}`);
});

/** TODO return promise of friends json. */
function findFriends(website) {
    //use different user-agents to avoid being blocked after repetitive requests
    //consider puppeteer to scrape dynamic sites as most are SPA these days
    var randomUserAgentList = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393", ]

    var randomUserAgent = randomUserAgentList[Math.floor(Math.random() * randomUserAgentList.length)];

    var config = {
        headers: { 'User-Agent': randomUserAgent }
    };
    return axios.get(website, config)
        .then((response) => {
            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);
                var title = $("title").html();
                const headings = [];
                const possibleWords = ["cat", "kitten", "dog", "puppy"]
                $("h1, h2, h3, h4, h5, h6").map(function(i, elem) {
                    for (var i = 0; i < possibleWords.length; i++) {
                        if ($(this).text().includes(possibleWords[i])) {
                            headings.push($(this).text());
                        }
                    }
                });

                console.log("title: " + title)
                console.log("headings: " + headings)
                return {
                    "title": title,
                    "headings": headings
                }
            }
        }, (error) => console.log(err));

    const redditResults = {
        "title": "A subreddit for cute and cuddly pictures",
        "headers": [
            "Sleepy kitten doing a face hug",
            "I finally got a puppy. I couldn’t possibly wish for anything more. She’s beautiful.",
            "Kittens Drifting",
            "Cat devours dog",
            "Puppies!"
        ]
    }

    // const cnnResults = {
    //     "title": "CNN - Breaking News, Latest News and Videos",
    //     "headers": []
    // }

    console.log("should show the following for 'https://www.reddit.com/r/aww': " + redditResults)

    // console.log("should show the following for 'https://www.cnn.com': " + cnnResults)




}