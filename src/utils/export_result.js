const Post = require("../models/post");
const fs = require('fs');

/**
 * @param {Post[]} result
 * @param {string} providerName
 * @param {Date} date 
 * @returns {{provider: string, date: Date, posts: Post[]}}
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
    return data;
}

module.exports = exportResult;