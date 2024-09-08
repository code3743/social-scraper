const Scraper = require("../core/scraper");
const Post = require("../models/post");
const { Page } = require("playwright-chromium");
class XProvider extends Scraper {
  constructor() {
    super("x");
    this.timeElapsed = {
      start: 0,
      end: 0,
    };
  }

  /**
   *
   * @returns {Promise<boolean>}
   */
  async init() {
    return await this.loginPage("https://x.com");
  }

  /**
   * @param {number} limitPosts
   * @param {string} user
   */
  async scrape(limitPosts, user) {
    if (!limitPosts || !user) {
      throw new Error("Los parámetros limitPosts y user son requeridos");
    }
    const page = await this.getCurrentPageContext();
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

          if (
            this.posts.length >= limitPosts ||
            this.timeElapsed.start > 5000
          ) {
            console.log("break");
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
   *
   * @param {Page} page
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
      const index =
        json.data.user.result.timeline_v2.timeline.instructions.findIndex(
          (i) => i.type === "TimelineAddEntries"
        );
      const data =
        json.data.user.result.timeline_v2.timeline.instructions[index].entries;

      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        if (entry.content.entryType !== "TimelineTimelineItem") {
          continue;
        }

        if (entry.content.itemContent.tweet_results.result.legacy.retweeted) {
          continue;
        }
        const id = entry.entryId;
        const content =
          entry.content.itemContent.tweet_results.result.legacy.full_text;

        const media = [];
        const mediaRaw =
          entry.content.itemContent.tweet_results.result.legacy.entities
            .media || [];

        for (let j = 0; j < mediaRaw.length; j++) {
          const mediaItem = mediaRaw[j].media_url_https;
          media.push(mediaItem);
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
