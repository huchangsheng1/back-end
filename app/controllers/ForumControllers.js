const forum_model = require('../models/ForumModel');

let ForumControllers = {

    //发表问题
    post_addask(req,res,next){
        let {course_id,ask_text} = req.body;
        let uid = req.userdata.uid;
        let reg = /[0-9]+/;
        
        if (!reg.test(Number(uid)) || !reg.test(Number(course_id)) || !ask_text) {
            res.send({
                code : 505,
                mes : 'uid or course_id Do not conform to the'
            })
            return;
        }
        forum_model.addaskModel(uid,course_id,ask_text).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    //回答问题
    post_addreplay(req,res,next) {
        let {replay_text,ask_key} = req.body;

        let uid = req.userdata.uid;
        let reg = /[0-9]+/;
        console.log(replay_text);
        if (!reg.test(Number(uid)) || !reg.test(Number(ask_key)) || !replay_text) {
            res.send({
                code : 505,
                mes : 'uid or ask_key Do not conform to the'
            })
            return;
        }
        
        forum_model.addreplayModel(uid,replay_text,ask_key).then(response => {
            
            res.send(response);
        },err => {
            throw err;
        })
    },
    //删除发布的问题,把回答都删除
    post_delask(req,res,next) {
        let {ask_key} = req.body;

        let reg = /[0-9]+/;
        
        if (!reg.test(Number(ask_key))) {
            res.send({
                code : 505,
                mes : 'ask_key Do not conform to the'
            })
            return;
        }
        forum_model.delaskModel(ask_key).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    //删除回答
    post_delreplay(req,res,next) {
        let {replay_key} = req.body;

        let reg = /[0-9]+/;
        
        if (!reg.test(Number(replay_key))) {
            res.send({
                code : 505,
                mes : 'replay_key Do not conform to the'
            })
            return;
        }
        forum_model.delreplayModel(replay_key).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    //查看问题里面的回答
    get_showask(req,res,next) {
        
        let {ask_key} = req.query;

        let reg = /[0-9]+/;
        
        if (!reg.test(Number(ask_key))) {
            res.send({
                code : 505,
                mes : 'ask_key Do not conform to the'
            })
            return;
        }
        forum_model.findreplayModel(ask_key).then(response => {
          
            res.send(response);
        },err => {
            throw err;
        })
    },
    //绚烂所有的问题
    get_selectask(req,res,next) {
        let {page,keyword,course_id} = req.query;
        if (!page || isNaN(Number(page)) || page == '' || page == undefined) {
            page = 1;           
        }
        forum_model.selectaskModel(page,keyword,course_id).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },
    
    //查询出该问题多少个回复
    get_count(req,res,next){
        let {ask_key} = req.query;
        let reg = /[0-9]+/;
        
        if (!reg.test(Number(ask_key))) {
            res.send({
                code : 505,
                mes : 'ask_key Do not conform to the'
            })
            return;
        }
        forum_model.getaskcount(ask_key).then(response => {
            res.send(response);
        },err => {
            throw err;
        })

        
    }

}

module.exports = ForumControllers;