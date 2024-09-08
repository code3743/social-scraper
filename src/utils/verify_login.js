const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompts the user to confirm whether they have successfully logged in.
 * This function is used in conjunction with web scraping tasks that require manual login.
 * 
 * @returns {Promise<boolean>} - Resolves to true if the user confirms login with 'y', otherwise false.
 */
const verifyLogin = () => {
  return new Promise((resolve) => {
    console.log('Please log in to the provider page.');
    console.log('Once you have logged in, press "y" to continue or any other key to cancel.');
    rl.question('Have you logged in? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('Login confirmed. Continuing...');
        resolve(true);  
      } else {
        console.log('Login not confirmed. Cancelling...');
        resolve(false); 
      }
      rl.close();
    });
  });
};

module.exports = verifyLogin;
