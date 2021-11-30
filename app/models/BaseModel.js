const MyDB =  require('../../libs/MyDB');
const MyCrypto = require('../../utils/MyCrypto');
const {baseUrl} = require('../../config/index')
const MyFs = require('../../utils/MyFS');
module.exports = {

    // 数据库操作类
    mydb: new MyDB(),      
    baseUrl :baseUrl,
    /**
     * 
     * @param {Regexp} reg 正则匹配表达式 
     * @param {string} str 需要验证的字符串
     * @returns {boolean} true或false
     */
    check_regexp:function(reg,str){        
        return reg.test(str);
    },

    //加密解密工具
    mycrypto : MyCrypto,


    //fs模块封装
    myfs:MyFs,

    //时间日期转化

    datetime(stime) {
        let strtime = new Date(stime);
        strtime = strtime.getFullYear() + '-' + (strtime.getMonth() + 1) + '-' + strtime.getDate() + ' ' +
            strtime.getHours() + ':' + strtime.getMinutes() + ':' + strtime.getSeconds();
        return strtime;
    },

    // 日志信息
    addlog : function(req,desc){
        
        let date = new Date();
        let datatime = date.getFullYear()+1;
        if (datatime == 13) {
            datatime = 1;
        }
        let log_time = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        let ip = req.ip.replace('::ffff:',"")
        let data = {
            "uid": Number(req.userdata.uid),
            "content":desc.text,
            "log_time" :log_time,
            "log_ip" : ip,
            "log_type":desc.type
        }
        try {
            this.mydb.add('st_log',data).then(res => {
               
            },err => {throw err})
        }catch(err) {
            throw err;
        }     
    }
}
