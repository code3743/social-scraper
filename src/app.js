const XProvider = require("./providers/x-provider");
const main = async () => {
    const xProvider = new XProvider();
    const isLoggedIn =  await xProvider.init();
    if (!isLoggedIn) {
        console.log('No se pudo iniciar sesión');
        process.exit(0);
    }
    await xProvider.scrape(10, 'flutterdev');
    const result = xProvider.getResults();
    console.log(result);
    process.exit(0);
}

main();