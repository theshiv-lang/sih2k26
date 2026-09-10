import fs from 'fs';

const en = JSON.parse(fs.readFileSync('frontend/src/locales/en.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('frontend/src/locales/hi.json', 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], prefix + k + '.'));
    } else {
      keys.push(prefix + k);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const hiKeys = getKeys(hi);

const missingInHi = enKeys.filter(k => !hiKeys.includes(k));
const missingInEn = hiKeys.filter(k => !enKeys.includes(k));

console.log('Total English keys:', enKeys.length);
console.log('Total Hindi keys:', hiKeys.length);
console.log('Missing in Hindi:', missingInHi);
console.log('Missing in English:', missingInEn);

if (missingInHi.length === 0 && missingInEn.length === 0) {
  console.log('SUCCESS: 100% dictionary key parity between en.json and hi.json!');
} else {
  process.exit(1);
}
