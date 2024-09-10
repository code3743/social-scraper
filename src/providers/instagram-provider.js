const Scraper = require("../core/scraper");
const { Page} = require('playwright-chromium');
const Post = require("../models/post");
class InstagramProvider extends Scraper {
    constructor() {
        super("instagram", "https://instagram.com"); 
        this.timeElapsed = {
            start: 0,
            end: 0,
          };
    }
    
    /**
     * @param {number} limitPosts
     * @param {string} user
     * @param {boolean?} headless 
     */
    async scrape(limitPosts, user, headless = true) {
        if (!limitPosts || !user) {
            throw new Error("Parameters limitPosts and user are required");
          }
        const page = await this.getCurrentPageContext(headless);
        await this.#interceptRequest(page, limitPosts);
        await page.goto(`${this.baseUrl}/${user}`);
        await page.waitForLoadState();
        await page.waitForTimeout(4000);

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
     * 
     * @param {Page} page 
     * @param {number} limitPosts 
     */
    async #interceptRequest(page, limitPosts) {
        await page.route('**/query', async (route, request)=>{
            await route.continue();
            const response = await request.response();
            const data = await response.body();
            const json = JSON.parse(data.toString());
            if (!json.data.xdt_api__v1__feed__user_timeline_graphql_connection){
                return;
            }
            const posts = json.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges;
            for (let i = 0; i < posts.length; i++) {
                if (this.posts.length >= limitPosts){
                    return;
                }
                const post = posts[i].node;
                const id = post.id;
                const content = post.caption.text ?? '';
                const media = [];
                if (post.carousel_media){
                    for (let j = 0; j < post.carousel_media.length; j++) {
                        const mediaUrl = post.carousel_media[j].image_versions2.candidates[0].url;
                        media.push(mediaUrl);
                    }
                }
                if (post.video_versions){
                    media.push(post.video_versions[0].url);
                }

                if (!media.length){
                    const url = post.image_versions2.candidates[0].url; 
                    media.push(url);
                }
                this.addPost(new Post(id, content, media));
            }
            this.timeElapsed.end = Date.now();
        });
    }

}


module.exports = InstagramProvider;