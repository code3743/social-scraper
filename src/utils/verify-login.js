const inquirer = require('inquirer');


/**
 * Prompts the user to confirm whether they have successfully logged in.
 * This function is used in conjunction with web scraping tasks that require manual login.
 * 
 * @returns {Promise<boolean>} - Resolves to true if the user confirms login with 'y', otherwise false.
 */
const verifyLogin = async () => {
  const prompt = inquirer.createPromptModule();

 const {login} = await prompt([
    {
      type: 'confirm',
      name: 'login',
      message: 'Have you logged in to the provider page?',
      default: false,
    }
  ]);

  if (login) {
    console.log('Login confirmed. Continuing...');
    return true;
  }
  console.log('Login not confirmed. Cancelling...');
  return false;
};

module.exports = verifyLogin;