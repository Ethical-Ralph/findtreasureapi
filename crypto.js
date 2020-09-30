// Nodejs encryption with CTR
const crypto = require("crypto");
const algorithm = "aes-256-cbc";

// function encrypt(text) {
//   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
//   let encrypted = cipher.update(text);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
// }

function decrypt(text, iv, key) {
  let encryptedText = Buffer.from(text, "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function decryptNtimes(text, key, iv, n) {
  for (let i = 0; i < n; i++) {
    text = decrypt(text, iv, key);
  }
  return text;
}

module.exports = decryptNtimes;
