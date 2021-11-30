const crypto = require('crypto');
const {cryptomd} = require('../config/index');
/**
 * 
 * @param {string} str 把字符串或者数子传进来进行加密
 * @returns {string} str 返回加密的密文
 */
function cryptedFn(str) {
    const cipher = crypto.createCipher(cryptomd.format,cryptomd.key);

    let crypted = cipher.update(str,'utf8',cryptomd.hex);

    crypted += cipher.final(cryptomd.hex) //加密结果
    return crypted;
}

/**
 *@param {string} str 把加密的密文传进来进行解密
 *@returns {string} str 返回解密后的文字
*/

function decryptedFn(str) {
    //解密
    const decipher = crypto.createDecipher(cryptomd.format,cryptomd.key);

    let decrypted = decipher.update(str,cryptomd.hex,'utf8');

    decrypted += decipher.final('utf8');
    return decrypted;
}


module.exports = {
    cryptedFn,
    decryptedFn
}