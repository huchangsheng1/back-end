//验证来源,域名
const urllib = require('url');
const MyDB = require('../libs/MyDB');
const mydb = new MyDB();

module.exports =async function(req,res,next) {

    let reqUrlArr = urllib.parse(req.url, true).pathname.toLowerCase();
        reqUrlArr = reqUrlArr.split('/');
    let purl = reqUrlArr[1] + '/' + reqUrlArr[2];   


    //不分权限接口
    let  {unwantedurl} = require('../config/index');
    
    //教师，教务，管理员 使用
       if ((req.headers.host == 'localhost:3000' || req.headers.host == '127.0.0.1:3000') && unwantedurl.indexOf(purl) < 0 ) {
            await mydb.select('st_rorp',['rid'],'rid=?',[req.userdata.rid]).then(res => {
                if (res.length == 0) {
                    res.send({
                        code : 4013,
                        mes : 'you is not power'
                })
                return;
            }
        })
        
        try {
            if (req.userdata.rid == 1) {
                next();
                return;
            }
            mydb.select('st_power,st_rorp',['st_power.purl'],'st_power.menu = 1 and st_power.p_id=st_rorp.p_id and  st_rorp.rid=?',[req.userdata.rid])
            .then(result => {
                let powerArr = []; 
                
                for (let i=0 ;i<result.length ; i++) {
                    powerArr.push(result[i].purl);
                }
                if (powerArr.includes(purl)) {
                    next();
                }else {
                    res.send({
                        code : 4013,
                        mes : 'you is not power'
                    })
                }
            })
        }catch(err) {
            throw err;
        }

    }else {
        
        mydb.select('st_power','purl','purl=?',purl).then(response => {
            if (response.length == 0) {
                next();
            }else {
                res.send({
                    code : 4013,
                    mes : 'you is not power'
                })
            }
        })
    }
        
   
}