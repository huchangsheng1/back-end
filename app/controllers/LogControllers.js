const log_model = require('../models/LogModel');
let LogControllers = {

    //添加日志信息
    /**
     * 
     * @param {object} data 
     *      data 的参数以键值对的形式就行
     *      uid	int(10)		操作的用户id
     *      content	varchar(60)		操作日志内容
     *      log_time	datetime		操作时间        //时间搓
     *      log_ip	varchar(20)		操作的人的IP
     *      log_type	tinyint(1)		操作的类型,0为用户类,1为考试作业类,2为课程类
     * 
     */
    post_addlog : function(req,res,next) {
        log_model.addlog(req.body.data).then(response => {
            res.send(response);
        },err => {throw err})
    },

    //分页查看每次10个，可带参数
    get_selectlog : function(req,res,next) {
        let {page,keyword,category,start_time,end_time} =req.query;
       
        page = parseInt(page);
        if (isNaN(page)) page = 1;
        
        log_model.selectlog(page,keyword,category,start_time,end_time).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    
    //批量删除日志信息
    post_dellog : function (req,res,next) {
        let dataArr =  req.body.log_keyArr;
        if (!dataArr instanceof Array) {
            res.send({
                code : 506,
                mes : 'data is type error'
            })
        }
        log_model.dellog(dataArr).then(response => {
            res.send(response);
        },err => {
             throw err;
        })
    }
    



}

module.exports = LogControllers;