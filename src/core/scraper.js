const { chromium, Page} = require('playwright-chromium');
const verifyLogin = require('../utils/verify_login');
const fs = require('fs');
const exportResult = require('../utils/export_result');


class Scraper {
    /**
     * @param {string} providerName 
     */
    constructor(providerName) {
        this.providerName = providerName;
        this.browser = null;
        this.page = null;
        this.posts = [];
    }
    
    /**
     * 
     * @param {boolean?} headless 
     */
    async launchBrowser(headless = true) {
        const browser = await chromium.launch({headless});
        const storage = fs.existsSync(`storage/${this.providerName}-storage.json`) ? JSON.parse(fs.readFileSync(`storage/${this.providerName}-storage.json`)) : undefined;
        this.browser =  await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
                locale: 'es-ES',
                storageState: storage
        });
    }

    /**
     * @param {string} url 
     * @returns {Promise<boolean>}
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
     * 
     * @param {boolean?} distroySession 
     */
    async closeBrowser(distroySession = false) {
        console.log('Cerrando el navegador...');
        if (distroySession) {
            await this.#destroySession();
        }
        await this.browser.close();
    }

    async #saveSession() {
        const storageState = await this.browser.storageState();
        console.log('Guardando la sesión...');
        if (!fs.existsSync('storage')) {
            fs.mkdirSync('storage');
        }
        fs.writeFileSync(`storage/${this.providerName}-storage.json`, JSON.stringify(storageState));
        console.log('Sesión guardada');
    }

    async #destroySession() {
        fs.unlinkSync(`storage/${this.providerName}-storage.json`);
    }

    /**
     * Method that must be implemented by the classes that extend `Scraper`.
     * This method is responsible for performing the main task of scraping or extracting posts
     * from a specific provider or platform. During its execution, the method must access the target 
     * website, extract the desired post information, and then store that information in the `this.posts` array, 
     * which will later be used to export the results.
     * @param {number} limitPosts 
     * @param {string} user 
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async scrape(limitPosts, user) {
        throw new Error('Implement this method in the provider class');
    }

    getResults() {
        return exportResult(this.posts, this.providerName, new Date());
    }

    
    /**
     * @param {boolean?} headless
     * @returns {Promise<Page>}
     */
    async getCurrentPageContext(headless = false) {
        await this.launchBrowser(headless);
        this.page = await this.browser.newPage();
        return this.page;
    }

}


module.exports = Scraper;