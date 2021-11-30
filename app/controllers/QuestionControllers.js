const question_model = require('../models/QuestionModel');

let QuestionControllers = {
    // 题库渲染
    get_index: function(req, res, next) {
       let {page, keyword } = req.query
       let {uid,rid} = req.userdata;
        question_model.get_index(page,keyword,uid,rid).then(
            result => {
                res.send(result)
            },err => {
                throw err;
            }
        )
    },

    //题库删除
    post_deletetopic: function(req, res, next) {
        question_model.post_deletetopic(req.body).then(
            result => {
                res.send(result)
            }
        )
    },


    //题库修改
    post_altertopic: function(req, res, next) {
        question_model.post_altertopic(req.body).then(
            result => {
                res.send(result)
            }
        )
    }

}

module.exports = QuestionControllers;