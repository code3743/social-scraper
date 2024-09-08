const Scraper = require("../core/scraper");
const Post = require("../models/post");
const { Page } = require("playwright-chromium");

class XProvider extends Scraper {
  constructor() {
    super("x"); // Initializes the scraper for the "X" provider (formerly Twitter)
    this.timeElapsed = {
      start: 0,
      end: 0,
    };
  }

  /**
   * Initiates the login process for the X platform.
   * @returns {Promise<boolean>} - Returns true if login was successful, otherwise false.
   */
  async init() {
    return await this.loginPage("https://x.com");
  }

  /**
   * Scrapes posts from a given user's timeline on X (formerly Twitter).
   * @param {number} limitPosts - The maximum number of posts to scrape.
   * @param {string} user - The username of the profile to scrape posts from.
   * @param {boolean} headless - Specifies whether the browser should run in headless mode (no UI).
   * @throws {Error} - Throws an error if limitPosts or user is not provided.
   */
  async scrape(limitPosts, user, headless = true) {
    if (!limitPosts || !user) {
      throw new Error("Parameters limitPosts and user are required");
    }
    const page = await this.getCurrentPageContext(headless);
    await this.#interceptRequest(page);
    await page.goto(`https://x.com/${user}`);
    await page.waitForLoadState();
    await page.waitForSelector('div[data-testid="UserName"]');
    await page.waitForTimeout(5000);

    let lastHeight = -1; 
    while (this.posts.length < limitPosts) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      this.timeElapsed.start = 0;
      const waitForNewTweets = async () => {
        while (this.timeElapsed.start < 5000) {
          await page.waitForTimeout(500);
          this.timeElapsed.start = Date.now() - this.timeElapsed.end;

          if (this.posts.length >= limitPosts || this.timeElapsed.start > 5000) {
            break;
          }
        }
      };

      await waitForNewTweets();

      if (this.posts.length >= limitPosts) {
        break;
      }
      let currentScroll = await page.evaluate(() => window.scrollY);
      if (lastHeight === currentScroll) {
        break;
      } else {
        lastHeight = currentScroll;
      }
    }
    await this.closeBrowser(true); 
  }

  /**
   * Intercepts network requests to capture user tweets data.
   * @param {Page} page - The Playwright page object to monitor network requests.
   */
  async #interceptRequest(page) {
    await page.route("**/UserTweets?variables=**", async (route, request) => {
      await route.continue();
      const response = await request.response();
      const responseBody = await response.body();
      const json = JSON.parse(responseBody.toString());
      if (!json.data.user.result.timeline_v2.timeline.instructions) {
        return;
      }
      const index = json.data.user.result.timeline_v2.timeline.instructions.findIndex(
        (i) => i.type === "TimelineAddEntries"
      );
      const data = json.data.user.result.timeline_v2.timeline.instructions[index].entries;

      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        if (entry.content.entryType !== "TimelineTimelineItem") {
          continue; 
        }

        if (entry.content.itemContent.tweet_results.result.legacy.retweeted) {
          continue; 
        }
        const id = entry.entryId;
        const content = entry.content.itemContent.tweet_results.result.legacy.full_text || "";
        const media = [];

        const mediaRaw = entry.content.itemContent.tweet_results.result.legacy.entities.media || [];
        for (let j = 0; j < mediaRaw.length; j++) {
          media.push(mediaRaw[j].media_url_https);
        }
        if (this.posts.find((p) => p.id === id)) {
          continue;
        }

        this.posts.push(new Post(id, content, media));
      }
      this.timeElapsed.end = Date.now();
    });
  }
}

module.exports = XProvider;
