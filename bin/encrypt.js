let crypto = require('crypto');
let prompt = require('sync-prompt').prompt;

let ALGORITHM = 'aes256';
let BASE = 'base64';
let ENCODING = 'utf8';

console.log('Welcome to the Configurez encypt script');

/*eslint no-alert:0*/
let data = prompt('Value: ');
let pass = prompt.hidden('Password: ');

let text = JSON.stringify({ value: data });

let cipher = crypto.createCipher(ALGORITHM, pass);
let crypted = cipher.update(text, ENCODING, BASE);
crypted += cipher.final(BASE);

console.log('Encrypted: ' + crypted);
