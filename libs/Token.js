const jwt = require('jsonwebtoken');
const {token} = require('../config/index');

module.exports = {
    //加密token
    setToken: function(data) {
        let tokens = jwt.sign(data, token.secretkey, { expiresIn: token.expiresIn });
        return tokens;
    },


    //解密token
    getToken: function(tokens) {
        
        return jwt.verify(tokens, token.secretkey); 
    }
}