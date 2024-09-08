const fs = require('fs');
const { chromium, Page } = require('playwright-chromium');

const verifyLogin = require('../utils/verify-login');
const exportResult = require('../utils/export-result');
const Post = require('../models/post');

class Scraper {
    /**
     * Constructor for the Scraper class.
     * @param {string} providerName - Name of the provider or social media platform (e.g., 'instragram', 'facebook').
     */
    constructor(providerName) {
        this.providerName = providerName;
        this.browser = null;
        this.page = null;
        this.posts = []; // Array to store the scraped posts
    }

    /**
     * Launches the Playwright browser and loads the storage state (cookies, session, etc.)
     * if a session file for the provider exists.
     * @param {boolean?} headless - Specifies whether the browser should run in headless mode (no UI).
     */
    async launchBrowser(headless = true) {
        const browser = await chromium.launch({ headless });
        const storage = fs.existsSync(`storage/${this.providerName}-storage.json`) 
            ? JSON.parse(fs.readFileSync(`storage/${this.providerName}-storage.json`)) 
            : undefined;
        this.browser = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
            locale: 'es-ES',
            storageState: storage
        });
    }

    /**
     * Navigates to the login page, verifies if login is successful, 
     * saves the session, and closes the browser.
     * @param {string} url - URL of the login page.
     * @returns {Promise<boolean>} - Returns true if login is successful, otherwise false.
     */
    async loginPage(url) {
        await this.launchBrowser(false);
        this.page = await this.browser.newPage();
        await this.page.goto(url);
        const responseLogin = await verifyLogin();
        if (!responseLogin) {
            await this.closeBrowser();
            return false;
        }
        await this.#saveSession();
        await this.closeBrowser();
        return true;
    }

    /**
     * Closes the browser and optionally destroys the saved session.
     * @param {boolean?} destroySession - If true, the saved session file is deleted.
     */
    async closeBrowser(destroySession = false) {
        console.log('Closing the browser...');
        if (destroySession) {
            await this.#destroySession();
        }
        await this.browser.close();
    }

    /**
     * Saves the current session state (cookies, local storage) to a JSON file.
     * This allows the session to be reused in future executions.
     * @private
     */
    async #saveSession() {
        const storageState = await this.browser.storageState(); 
        console.log('Saving the session...');

        if (!fs.existsSync('storage')) {
            fs.mkdirSync('storage');
        }
        fs.writeFileSync(`storage/${this.providerName}-storage.json`, JSON.stringify(storageState));
        console.log('Session saved');
    }

    /**
     * Deletes the saved session file for the current provider.
     * @private
     */
    async #destroySession() {
        if (!fs.existsSync(`storage/${this.providerName}-storage.json`)) {
            return;
        }
        fs.unlinkSync(`storage/${this.providerName}-storage.json`); // Delete the session file
    }

    /**
     * Abstract method that must be implemented by classes that extend `Scraper`.
     * This method is responsible for performing the scraping on a specific platform, 
     * accessing the target page, extracting post information, and storing it in the `this.posts` array.
     * @param {number} limitPosts - Maximum number of posts to extract.
     * @param {string} user - The username or identifier of the account from which to scrape posts.
     * @param {boolean} headless - Specifies whether the browser should run in headless mode.
     * @returns {Promise<void>}
     * @throws {Error} - If the method is not implemented in the child class.
     */
    async scrape(limitPosts, user, headless) {
        throw new Error('Implement this method in the provider class'); // Error if not implemented
    }

    /**
     * Exports the scraped results to a JSON file in the `/results` folder.
     * The file name includes the provider name and the current date.
     * @returns {{provider: string, date: Date, posts: Post[]}} - Object containing the exported results.
     */
    getResults() {
        return exportResult(this.posts, this.providerName, new Date());
    }

    /**
     * Launches the browser in the current context and opens a new page. Useful for obtaining
     * the current page either in headless or non-headless mode.
     * @param {boolean?} headless - Specifies whether the browser should run in headless mode.
     * @returns {Promise<Page>} - Returns the current browser page.
     */
    async getCurrentPageContext(headless = false) {
        await this.launchBrowser(headless);
        this.page = await this.browser.newPage();
        return this.page;
    }
}

module.exports = Scraper;
