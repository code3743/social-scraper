const fs = require('fs');
const { chromium, Page, BrowserContext } = require('playwright-chromium');

const verifyLogin = require('../utils/verify-login');
const exportResult = require('../utils/export-result');
const Post = require('../models/post');

class Scraper {

    /**
     * @type {BrowserContext} - Current browser context.
     */
    #browser;
    /**
     * @type {string} - Base URL of the provider's website.
     */
    #baseUrl;
    /**
     * @type {string} - Name of the provider or social media platform.
     */
    #providerName;
    /**
     * @type {Post[]} - Array to store the scraped posts.
     */
    #posts

    /**
     * Constructor for the Scraper class.
     * @param {string} providerName - Name of the provider or social media platform (e.g., 'instragram', 'facebook').
     * @param {string} baseUrl - Base URL of the provider's website (e.g., 'https://www.instagram.com/').
     */
    constructor(providerName, baseUrl) {
        this.#baseUrl = baseUrl;
        this.#providerName = providerName;
        this.#posts = [];
    }

    /**
     * Launches the Playwright browser and loads the storage state (cookies, session, etc.)
     * if a session file for the provider exists.
     * @param {boolean?} headless - Specifies whether the browser should run in headless mode (no UI).
     */
    async launchBrowser(headless = true) {
        const browser = await chromium.launch({ headless });
        const path = `storage/${this.#providerName}-storage.json`;
        const storage = fs.existsSync(path) 
            ? JSON.parse(fs.readFileSync(path)) 
            : undefined;
        this.#browser = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
            locale: 'es-ES',
            storageState: storage
        });
    }

    /**
     * Navigates to the login page, verifies if login is successful, 
     * saves the session, and closes the browser.
     * @param {string?} path - Path to the login page.
     * @returns {Promise<boolean>} - Returns true if login is successful, otherwise false.
     */
    async login(path) {
        await this.launchBrowser(false);
        const page = await this.#browser.newPage();
        await page.goto(`${this.#baseUrl}${path ?? ''}`);
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
        await this.#browser.close();
    }

    /**
     * Saves the current session state (cookies, local storage) to a JSON file.
     * This allows the session to be reused in future executions.
     * @private
     */
    async #saveSession() {
        const storageState = await this.#browser.storageState(); 
        console.log('Saving the session...');

        if (!fs.existsSync('storage')) {
            fs.mkdirSync('storage');
        }
        fs.writeFileSync(`storage/${this.#providerName}-storage.json`, JSON.stringify(storageState));
        console.log('Session saved');
    }

    get baseUrl() { 
        return this.#baseUrl;
    }

    /**
     * Deletes the saved session file for the current provider.
     * @private
     */
    async #destroySession() {
        const path = `storage/${this.#providerName}-storage.json`;
        if (!fs.existsSync(path)) {
            return;
        }
        fs.unlinkSync(path); 
    }

    /**
     * Adds a post to the `this.posts` array.
     * @param {Post} post 
     * @returns 
     */
    addPost(post) {
        if (!(post instanceof Post)) {
            throw new Error('The post must be an instance of the Post class');
        }
        if(this.#posts.find(p => p.id === post.id)) {
            return;
        }
        this.#posts.push(post);
    }

    get posts() {
        return this.#posts;
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
        return exportResult(this.#posts, this.#providerName, new Date());
    }

    /**
     * Launches the browser in the current context and opens a new page. Useful for obtaining
     * the current page either in headless or non-headless mode.
     * @param {boolean?} headless - Specifies whether the browser should run in headless mode.
     * @returns {Promise<Page>} - Returns the current browser page.
     */
    async getCurrentPageContext(headless = false) {
        await this.launchBrowser(headless);
        const page = await this.#browser.newPage();
        return page;
    }
}

module.exports = Scraper;
