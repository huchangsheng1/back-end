const grade_model = require('../models/GradeModel');
let GradeControllers = {

    //创建班级 
    post_create(req,res,next) {
        let {gname,gArr} = req.body;
        let uid = req.userdata.uid;
        if (!gname || !uid ) {
            res.send({
                code:505,
                mes : 'gname or uid the is null'
            })
            return;
        }
        
        grade_model.createModel(gname,uid,gArr).then(response => {
            res.send(response)
        },err => {
            throw err;
        })
    },

    //解散班级
    post_del(req,res,next) {
        let {gid} = req.body;
        if (!gid) {
            res.send({
                code:505,
                mes : 'grade is id null'
            })
            return;
        }
        grade_model.delModel(gid).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //查询班级，渲染所有班级，带模糊查询
    get_find(req,res,next){
       let {page,keyword} = req.query;
        page = parseInt(page);
        if (isNaN(page)) page = 1;
        grade_model.findModel(page,keyword).then(response => {
           
            res.send(response);
        },err => {
            throw err;
        })
    },

    //查看某个班级里面的人数 和学生
    get_showst(req,res,next) {
        let {gid} = req.query
        if (!gid || isNaN(Number(gid)) || gid == 0) {
            res.send({
                code : 503,
                mes : 'gid is null or gid Do not conform to the'
            })
            return;
        }
        grade_model.showStModel(gid).then(response => {
            res.send(response);
        },err => {throw err})
    },

    //批量添加学生进入班级
    post_addst(req,res,next) {
        let {gid,uArr} = req.body;
        if (!gid || isNaN(Number(gid)) || !(uArr instanceof Array)) {
            res.send({
                code : 505,
                mes : 'gid or uArr Do not conform to the'
            })
        }
        grade_model.addStModel(gid,uArr).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    //单条或批量删除班级的学生
    post_delst(req,res,next) {
        let {gid,uArr} = req.body;
        if (!gid || isNaN(Number(gid)) || !(uArr instanceof Array)) {
            res.send({
                code : 505,
                mes : 'gid or uArr Do not conform to the'
            })
        }
        grade_model.delStModel(gid,uArr).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //修改班级信息等
    post_alterst(req,res,next) {
        let {gid,gname} = req.body;
        let uid = req.userdata.uid;
        if (!gid) {
            res.send({
                code : 505,
                mes : 'gid or uArr Do not conform to the'
            })
        }

        grade_model.alterModel(gid,gname,uid).then(response => {
            res.send(response);
        },err => {
            throw err;
        })

    },

    //通过班级id 获取该班级所有课程名称和课程id
    get_findgrade(req,res,next){
        let {gid} = req.query;
        if (isNaN(Number(gid))) {
            res.send({
                code : 505,
                mes : 'you is the gid is type error'
            })
        }
        grade_model.getinfocourse(gid).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    
    //获取所有班级，不带模糊查询
    get_findsgrade(req,res,next){
         grade_model.findgradeModel().then(response => {
             res.send(response);
         },err => {
             throw err;
         })
     },

}   

module.exports = GradeControllers;