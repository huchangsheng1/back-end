const urllib = require('url'); 
const {token} = require('../config/index');
const decryptToken = require('../libs/Token');
const MyDB =  require('../libs/MyDB');
const mydb = new MyDB();
const tooken_model = require('../app/models/TokenModel');
module.exports = function(req, res, next) {
    let urlPath =  urllib.parse(req.url, true).pathname;
    

    if (token.unwantedurl.indexOf(urlPath) >= 0) {
        
        next();
    } else {
            
        
        if (req.headers && req.headers['user-token']) {
            let decoded = {};
            try {
                decoded = decryptToken.getToken(req.headers['user-token']);
            }catch(err) {
                res.send({
                    code : 502,
                    mes : 'token is overdue'
                })
                throw err;
            }
            
            if (!decoded || !decoded.uid) {
                res.send({
                    code: 502,
                    msg: 'token is null'
                })
      
            } else {
                //验证uid是否存在  验证挤出登录
                if (!decoded.exp *1000 > Date.now()) {
                    res.send({
                        code : 502,
                        mes : 'token is overdue'
                    })
                    return;
                }

                tooken_model.contrast(decoded)
                    .then(response => {
                        if (response.code != 200) {
                            res.send(response);
                        }else{
                            //把该用户的所有信息挂到req上面
                            req.userdata = decoded;
                            
                            next();
                        } 
                        return;
                   },err => {throw err})

                
                          
            }
            
        } else {
            res.send({
                code: 502,
                msg: 'token is null'
            })
        }
    }
    
}