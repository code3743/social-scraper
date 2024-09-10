const fs = require('fs');
const path = require('path');

/**
 * 
 * @returns {Array<{name: string, file: string}>}
 */
const listProviders = () => {

    const providersDir = path.join(__dirname, '../providers');
    const files = fs.readdirSync(providersDir);
    const providers = files.map(file => {
        
        return {
            name: file.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1))[0],
            value: file
        };
    });
    return providers;
}

module.exports = listProviders;