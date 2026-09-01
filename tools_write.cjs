const fs = require('fs');
const file = process.argv[2];
const b64File = process.argv[3];
const b64Str = fs.readFileSync(b64File, 'utf8').trim();
fs.writeFileSync(file, Buffer.from(b64Str, 'base64'));
console.log(file + ' written successfully');