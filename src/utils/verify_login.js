const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 
 * @returns {Promise<boolean>}
 */
const verifyLogin = () => {
  return new Promise((resolve) => {
    console.log('Por favor, inicie sesión en la página del proveedor.');
    console.log('Una vez que hayas iniciado sesión, presiona "y" para continuar o cualquier otra tecla para cancelar.');

    rl.question('¿Ya iniciaste sesión? (y/n): ', (answer) => {
    
      if (answer.toLowerCase() === 'y') {
        console.log('Sesión iniciada. Continuando...');
        resolve(true);  
      } else {
        console.log('No se pudo iniciar sesión. Cancelando...');
        resolve(false); 
      }
      
      rl.close();
    });
  });
};


module.exports = verifyLogin;
