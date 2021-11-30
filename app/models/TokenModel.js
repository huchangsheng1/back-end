let TokenModel = {

    //挤出登入
    contrast(data) {
        let tokenTime = data.tokentime;
        let uid = data.uid;
        return new Promise((resolve,reject) => {
            try {
               this.mydb.find('st_users','token','uid =?',[uid])
                    .then(res => {
                       
                        if (tokenTime < res.token) {
                            resolve({
                                code:502,
                                mes : 'token time is overdue',
                            })
                        }else {
                            resolve({
                                code:200,
                                mes : 'token time is ok',
                            })
                        }
                    },err => {
                        reject(err);
                    })
            }catch(err) {
               reject(err);   
            }
        })
    }

}




Object.setPrototypeOf(TokenModel, require('./BaseModel'));

module.exports = TokenModel;