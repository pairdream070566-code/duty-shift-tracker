const fs = require('fs');
const [, , file, b64] = process.arvgv;
fs.writeFileSync(file, Buffer.from(b64, 'base64'));
console.log(file + ' written');