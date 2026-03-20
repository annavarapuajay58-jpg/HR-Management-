const fs = require('fs');
const content = fs.readFileSync('server_output.log', 'utf16le');
console.log(content.substring(0, 5000));
