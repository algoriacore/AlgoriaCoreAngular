const fs = require('fs');
const version = Date.now().toString();

fs.writeFileSync('src/version.json', '{ "version": "' + version + '" }');
