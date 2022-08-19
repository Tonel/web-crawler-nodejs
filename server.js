const http = require("http")
const axios = require("axios")
const cheerio = require("cheerio")

http.createServer(async function (request, response) {
    // initialized with the first webpage to visit
    const paginationURLsToVisit = ["https://scrapeme.live/shop"]
    const visitedURLs = []

    const productURLs = new Set()

    // iterating until the queue is empty
    while (paginationURLsToVisit.length !== 0) {
        // the current webpage to crawl
        const paginationURL = paginationURLsToVisit.pop()

        try {
            // retrieving the HTML content from paginationURL
            const pageHTML = await axios({
                method: "GET",
                url: paginationURL
            })

            // adding the current webpage to the
            // webpages already crawled
            visitedURLs.push(paginationURL)

            // initializing cheerio on the current webpage
            const $ = cheerio.load(pageHTML.data)

            // retrieving the pagination URLs
            $(".page-numbers a").each((index, element) => {
                const paginationURL = $(element).attr('href')

                // adding the pagination URL to the queue
                // of webpages to crawl, if it wasn't yet crawled
                if (
                    !visitedURLs.includes(paginationURL) &&
                    !paginationURLsToVisit.includes(paginationURL)
                ) {
                    paginationURLsToVisit.push(paginationURL)
                }
            })

            // retrieving the product URLs
            $("li.product a.woocommerce-LoopProduct-link").each((index, element) => {
                const productURL = $(element).attr('href')
                productURLs.add(productURL)
            })
        }  catch (e) {
            // logging the error message
            console.error(e)
        }
    }

    // use productURLs for scraping purposes...

    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify([...productURLs]))
    response.end()
}).listen(8888)