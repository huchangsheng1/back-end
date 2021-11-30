const user_model = require('../models/UserModel');
const { setToken } = require('../../libs/Token');
const random = require('string-random');
let UserControllers = {

    //密码或短信登入
    post_login: function (req, res, next) {
        
        if (req.body.loginblo == 'false') {
            
            if (!req.body.phone || !req.body.password) {
                res.send({
                    code: '505',
                    mes: 'phone or password is null!'
                })
                return;
            }
            
        }
        user_model.post_loginModel(req.body,req).then(
            response => {

                if (response.code == 200) {
                    
                    res.setHeader("user-token", setToken(response.data));
                    
                    res.send({
                        code: 200,
                        mes: 'login ok!',
                        data:{
                            phone:response.data.phone,
                            uid:response.data.uid,
                            rid : response.data.rid,
                            rname : response.data.rname,
                            nickname : response.data.nickname,
                            headimg : response.data.headimg,
                            gid :  response.data.gid
                        }
                    })
                } else {
                    res.send(response);
                }
            }, err => {
                res.send({
                    code: 503,
                    errmsg: err
                })
            }
        )
    },
    //短信接口
    post_loginsms: function (req, res, next) {

        let reg = /^1[3-9][0-9]{9}$/;
        if (!reg.test(req.body.phone)) {
            res.send({
                code: 506,
                mes: 'phone is illegal '
            })
        }
        let smsnub = random(6, { letters: false });
        user_model.post_lognsmsModel(req.body.phone, smsnub)
            .then(response => {
                res.send(response);
            }, err => {
                res.send({
                    code: 400,
                    mes: 'sms is not error,please not Once again request'
                });
                throw err;
            })

    },

    //创建用户兵器给予权限
    post_adduser: function (req, res, next) {
        
        let reg = /^1[3-9][0-9]{9}$/;
        if (!reg.test(req.body.phone)) {
            res.send({
                code: 506,
                mes: 'phone illegal'
            })
            return;
        }
        
        if (req.body.rid == 1) {
            res.send({
                code : 401,
                mes : 'you is not power！'
            })
            return;
        } 

        user_model.post_adduserModel(req.body,req).then(response => {
            res.send(response);
        }, err => {
            throw err;
        })

    },

    //删除用户
    post_deluser: function (req, res, nex) {
        
        let reg = /^1[3-9][0-9]{9}$/;
        if (!reg.test(req.body.phone)) {
            res.send({
                code: 506,
                mes: 'phone illegal'
            })
            return;
        }
        user_model.post_deluserModel(req.body,req).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    
    //修改用户信息
    post_alteruser : function(req,res,nex) {
        

        let reg = /^1[3-9][0-9]{9}$/;
        if (!req.body.phone || !reg.test(req.body.phone)) {
            res.send({
                code:505,
                mes :' phone is null'
            })
            return;
        }
       
        user_model.post_alteruserModel(req.body.phone,req.body.data,req).then(response => {
            res.send(response);
        },err => {
            throw err ;
        })
    },

    //显示所有用户,并且把姓名角色啥都显示出来
    get_finduser : function(req,res,next) {
        let {page,keyword} = req.query;
        page = parseInt(page);
        
        if (isNaN(page)) page = 1;
        
        user_model.findModel(page,keyword)
        .then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //获取可更换头像
    get_userimg : function(req,res,next) {
        user_model.getimg().then(response => {
            for (let i in response.data) {
                response.data[i] = `${this.baseUrl}/img/userimg/` + response.data[i];
            }
            res.send(response);
        },err => {
            throw err;
        })
    },

    //更换头像
    post_usersetimg : function(req,res,next) {
        user_model.setimg(req).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //查询个人所有信息
    get_personal(req,res,next) {
 
        res.send({
            phone:req.userdata.phone,
            uid : req.userdata.uid,
            rname : req.userdata.rname,
            rid : req.userdata.rid,
            nickname : req.userdata.nickname,
            headimg : req.userdata.headimg,                    
            gid: req.userdata.gid
        })
    },

    //修改用户回显
    post_echo (req,res,next){
        let {phone} = req.body;
        
        let reg = /^1[3-9][0-9]{9}$/;
        if (!reg.test(phone)) {
            res.send({
                code: 506,
                mes: 'phone illegal'
            })
            return;
        }
        user_model.getpersonal(phone).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //单独修改用户密码
    post_alter(req,res,next) {
        
        let {phone,statpwd=123456,updatepwd=123456} = req.body;
        
        let reg = /^1[3-9][0-9]{9}$/;
        if (!reg.test(phone)) {
            res.send({
                code:505,
                mes :' phone is null'
            })
            return;
        }
      
        user_model.alterpwd(phone,statpwd,updatepwd).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
        
    }

}


module.exports = UserControllers;
