const Post = require("../models/post");
const fs = require('fs');

/**
 * Exports the scraped result to a JSON file and returns the data object.
 * @param {Post[]} result - Array of Post objects to be exported.
 * @param {string} providerName - The name of the social media provider (e.g., 'twitter', 'facebook').
 * @param {Date} date - The date when the data was scraped.
 * @returns {{provider: string, date: Date, posts: Post[]}} - Returns an object containing provider name, date, and posts.
 */
const exportResult = (result, providerName, date) => {
    const data = {
        provider: providerName,
        date: date,
        posts: result.map(post => post.toJSON()) 
    };
    if (!fs.existsSync('results')) {
        fs.mkdirSync('results');
    }
    fs.writeFileSync(`results/${providerName}-${date.toISOString()}.json`, JSON.stringify(data));
    console.log(`Scraped data has been exported to results/${providerName}-${date.toISOString()}.json`);
    return data;
};

module.exports = exportResult;