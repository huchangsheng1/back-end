const power_model = require('../models/PowerModel');
const { setToken } = require('../../libs/Token');
const random = require('string-random');



let PowerControllers = {
    //添加角色的权限表权限
    post_add : function(req,res,next){
        
        power_model.addModel(req.body,req).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
        
    },
    //删除角色的权限表的权限
    post_del : function(req,res,next) {
        power_model.delModel(req.body,req)
            .then(response => {
                res.send(response);
            },err => {
                throw err;
            })
    },
    //查找角色所拥有的权限
    post_find : function(req ,res ,next){
        power_model.findModel(req.userdata.rid).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //添加权限表的权限
    post_padd : function(req,res,next) {
        let {p_name,p_key,menu,purl} = req.body;
        if (!p_name) {
            res.send({
                code : 505,
                mes : ' you is the desc is null'
            })
        }
        if (menu == 1 && !purl) {
            purl = null;
        }   
        power_model.paddModel(p_name,p_key,menu,purl,req)
        .then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //删除权限表的权限
    post_pdel : function(req,res,next) {
        power_model.pdelModel(req.body,req)
        .then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //修改权限表里面的权限
    post_palter : function (req,res,next){   
        if (!req.body.p_name) {
            res.send({
                code:503,
                mes : 'power the name is null'
            })
            return;
        }
        try {
            power_model.palterModel(req.body,req).then(response => {
                res.send(response)
            },err => {
                throw err;                
            })
        }catch(err) {
            res.send({
                code:503,
                mes : 'power is null'
            })
            throw err;
        }
    },

    //展示权限结构
    get_pshow :async function(req,res,next) {
        let powerData = {};
        await power_model.pshowModel()
            .then(
                result => {
                    powerData = result;
                },err => {
                    throw err;
                }
            )
        if (req.userdata.rid == 1) {
            res.send({
                code : 200,
                mes : 'is power ok show',
                data : powerData
            })
        }
        power_model.pshowModel2(powerData,req.userdata.rid)
            .then(result => {
                res.send({
                    code : 200,
                    mes : 'is power ok show',
                    data : result
                })
            },err => {
                throw err;
        })
    },

    //角色表添加角色
    post_roleadd : function(req,res,next) {
        
        if (!req.body.rname) {
            res.send({
                code : 503,
                mes : 'role name is null'
            })
        }
        power_model.roleaddModel(req.body,req).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //角色表修改角色
    post_rolealter : function(req,res,next) {
        if (req.body.rid == 1) {
            res.send({
                code:503,
                mes : 'role the rid is not power'
            })
            return;
        }
        if (!req.body.rid || !req.body.rnametow) {
            res.send({
                code:503,
                mes : 'role the rid is null'
            })
            return;
        }
        power_model.rolealterModel(req.body,req).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //角色表删除角色
    post_roledel : function(req,res,next) {

        if (!req.body.rid) {
            res.send({
                code:503,
                mes : 'del the role name is null '
            })
            return;
        }
        
        power_model.roledelModel(req.body,req)
        .then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    //角色表显示所有角色
    get_roleshow : function(req,res,next) {
        power_model.roleshowModel().then(response => {
            res.send(response);
        },err => {
            throw err;
        }) 
    },

    // 通过角色id返回该角色拥有的权限
    get_rolepower(req,res,next) {
        let rid = req.query.rid;
        if (!rid) {
            res.send({
                code : 505,
                mes : 'you si the rid is null'
            })
        }
        power_model.getrolepowerModel(rid).then(response => {
           
            res.send(response);
        },err => {
            throw err;
        }) 

    },

    //修改权限表权限名称
    post_powername(req,res,next){
        let {p_id,p_name} = req.body;
        if (isNaN(parseInt(p_id)) || !p_name) {
            res.send({
                code :  505,
                mes : 'p_id or  p_name is null'
            })
        }
        power_model.setpowername(p_id,p_name).then(response => {
            res.send(response);
        },err => {
            throw err;
        }) 
    },
    
    //获取权限所有菜单
    get_powermenu(req,res,next) {
        power_model.powermenu().then(response => {
            res.send(response);
        },err => {
            throw err;
        }) 
    },
    
    //创建角色并且添加权限
    post_addroleandpow(req,res,next) {
        let data = JSON.parse(req.body.data);
        let rname = req.body.rname;
        if (!rname) {
            res.send({
                code : 505,
                mes : 'rname is null'
            })
        }
        power_model.roleandpow(rname,data,req).then(response => {
            res.send(response);
        },err => {
            throw err;
        }) 
        
    },
    //更新角色权限
    post_updatepower(req,res,next){
        let data = JSON.parse(req.body.data);
        let rid = req.body.rid;
        if (rid == 4) {
            res.send({
                code : 505,
                mes : 'role  not update'
            })
        }
        if (!rid) {
            res.send({
                code : 505,
                mes : 'rid is null'
            })
        }
        power_model.updatepow(rid,data,req).then(response => {
            res.send(response);
        },err => {
            throw err;
        }) 
    }

}

module.exports = PowerControllers;