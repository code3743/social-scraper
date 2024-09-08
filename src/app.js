const inquirer = require('inquirer');
const XProvider = require('./providers/x-provider'); 

/**
 * Prompts the user for input and returns a promise that resolves with the user's answers.
 * @returns {Promise<{provider: string, requireLogin: boolean, user: string, limitPosts: number, headless: boolean}>}
 */
const promptUser = () => {
    const prompt = inquirer.createPromptModule();
    return prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select a social media provider to scrape posts from:',
        choices: ['x']
      },
      {
        type: 'confirm',
        name: 'requireLogin',
        message: 'Do you need to log in to scrape posts?',
        default: false,
      },
      {
        type: 'input',
        name: 'user',
        message: 'Enter the username to scrape posts from (e.g., user123):',
        validate: (input) => {
            if (input.length > 0) {
                return true;
            } else {
                return 'Please enter a valid username.';
            }
        }
      },
        {
            type: 'number',
            name: 'limitPosts',
            message: 'Enter the maximum number of posts to scrape:',
           validate: (input) => {
                if (input > 0) {
                    return true;
                } else {
                    return 'Please enter a valid number.';
                }
           }
        },
        {
            type: 'confirm',
            name: 'headless',
            message: 'Run the browser in headless mode?',
            default: true,
        },
    ]);
};

/**
 * Initializes and runs the scraping process based on user input.
 * @param {string} provider - The social media provider to use.
 * @param {string} user - The username to scrape posts from.
 * @param {number} limitPosts - The maximum number of posts to scrape.
 * @param {boolean} requireLogin - Specifies whether the scraping requires manual login.
 * @param {boolean} headless - Specifies whether the browser should run in headless mode.
 */
const runScraper = async (provider, user, limitPosts, requireLogin, headless = true) => {
  let scraper;

  switch (provider.toLowerCase()) {
    case 'x':
      scraper = new XProvider();
      break;
    default:
      console.log('Provider not supported.');
      return;
  }

  if (requireLogin) {
    const isLoggedIn = await scraper.init();
    if (!isLoggedIn) {
      console.log('Failed to log in. Exiting...');
      return;
    }
  }

  console.log('Scraping posts...');
  await scraper.scrape(limitPosts, user, headless);
  scraper.getResults();
  console.log('Scraping completed. Results saved.');
  console.log('Exiting...');
  process.exit(0);
};


(async () => {
  const { provider, requireLogin, user, limitPosts, headless } = await promptUser();
  await runScraper(provider, user, limitPosts, requireLogin, headless);
})();
