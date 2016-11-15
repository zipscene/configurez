// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

let crypto = require('crypto');
let readlineSync = require('readline-sync');

let ALGORITHM = 'aes256';
let BASE = 'base64';
let ENCODING = 'utf8';

console.log('Welcome to the Configurez encypt script');

/*eslint no-alert:0*/
let data = readlineSync.question('Value: ');
let pass = readlineSync.question('Password: ', { noEchoBack: true });

let text = JSON.stringify({ value: data });

let cipher = crypto.createCipher(ALGORITHM, pass);
let crypted = cipher.update(text, ENCODING, BASE);
crypted += cipher.final(BASE);

console.log('Encrypted: ' + crypted);
