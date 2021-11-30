const exam_model = require('../models/ExamModel');
const nodeXlsx = require('node-xlsx');

let ExamControllers = {
    get_index: function (req, res, next) {
        res.send('exam get_index')
    },

    //手动创考题
    post_index: function (req, res, next) {
        let data = req.body;
        exam_model.post_index(data, req.userdata.uid).then(
            result => {
                if (result == '201') {
                    res.send({ code: 201, msg: '创建考试成功' })

                } else if (result == '411') {
                    res.send({ code: 411, msg: '请填写相应考题' })

                } else if (result == '410') {
                    res.send({ code: 410, msg: '请填写有效的开考时间' })
                }
            }
        )
    },


    //题库随机导入考题 
    post_questions: function (req, res, next) {
        let data = req.body;
        // console.log(data);
        exam_model.post_questions(data, req.userdata.uid).then(
            result => {
                if (result == '410') {
                    res.send({ code: 410, msg: '请填写有效的开考时间' })
                } else {
                    res.send(result)
                }

            }
        )
        // res.send(data)

    },

    //上传Excel题库文件
    post_upexcel: function (req, res, next) {
        res.send(exam_model.post_upexcel(req.files, req.userdata.uid))
    },

    //Excel表导题
    post_pourinexcel: function (req, res, next) {
        exam_model.post_pourinexcel(req.body, req.userdata.uid)
            .then(
                result => {
                    res.send(result)
                }
            )
    },

    //修改考试 考试相关数据回显
    get_revise: function (req, res, next) {
        exam_model.get_revise(req.query)
            .then(
                result => {
                    res.send(result);
                }
            )
    },


    //修改考试  确认修改考试相关内容  
    post_revise: function (req, res, next) {
        let data = req.body;
        exam_model.post_revise(data,req.userdata.uid)
            .then(
                result => {
                    if (result == 'cannot be empty') {
                        res.send({ code: 301, msg: '请填写相应考题' })
                    } else if (result == 'alter success') {
                        res.send({ code: 206, msg: '考题修改成功' })
                    }
                }
            )
    },


    // 删除考试
    get_delexam: function (req, res, next) {
        exam_model.get_delexam(req.query).then(
            result => {
                res.send(result)
            }
        )
    },


    // 发布考试
    get_relexam: function (req, res, next) {
        exam_model.get_relexam(req.query).then(
            result => {
                res.send(result)
            }
        )
    },

    //考试场次渲染(管理员、教务、教师)
    get_exameach: function (req, res, next) {
        let {page} = req.query;
        if (isNaN(Number(page))) {
            page = 1;
        }
        if (isNaN(Number(req.userdata['uid']))) {
            res.send({
                code : 505,
                mes : 'user the uid type error'
            })
        }

        exam_model.get_exameach(page,req)
            .then(
                result => {
                    if (result.code == 210) {
                        res.send({ code: 210, item: result['items'], testinfo: result['data'] })
                    } else if (result.code == 212) {
                        res.send({ code: 212, item: result['items'], testinfo: result['data'] });
                    }
                },err => {
                    throw err
                }
            )
    },


    //考试场次渲染(学生)
    get_stuexameach: function (req, res, next) {
    //    console.log(req.query)
        exam_model.get_stuexameach(req.query).then(
            result => {
                res.send(result)
            },err => {
                throw err;
            }
        )
    },

    // 学生查看成绩列表
    get_awaitexam: function (req, res, next) {
        exam_model.get_awaitexam(req.userdata.uid).then(
            result => {
                res.send(result)
            }
        )
    },

    

    //学生开始考试页面渲染
    get_startexam: function(req, res, next) {
        // console.log(2)
        exam_model.get_startexam(req.query).then(
            result => {
                res.send(result)
            }
        )
    },

    //学生交卷 提交答题答案
    post_submitanswer: function (req, res, next) {
        exam_model.post_submitanswer(req.body,req.userdata.uid).then(
            result => {
                res.send(result)
            }
        )
    },

    //教师批阅答卷 学生答卷等待批改列表
    get_showtestpaper: function (req, res, next) {
        let {page} = req.query;
        if (isNaN(Number(page))) {
            page = 1;
        }
        if (isNaN(Number(req.userdata['uid']))) {
            res.send({
                code : 505,
                mes : 'user the uid type error'
            })
        }

        exam_model.get_showtestpaper(page , req.userdata.rid, req.userdata.uid).then(
            result => {
                res.send(result)
            }
        )
    },

    //教师批阅答卷 回显学生答卷详情
    get_showdetails: function (req, res, next) {
        exam_model.get_showdetails(req.query).then(
            result => {
                res.send(result)
            }
        )
    },

    //教师批阅答卷
    post_correct: function (req, res, next) {
        exam_model.post_correct(req.body).then(
            result => {
                res.send(result)
            }
        )
    },

    //学生查看成绩
    get_viewscore: function (req, res, next) {
        exam_model.get_viewscore(req.query, req.userdata.uid).then(
            result => {
                res.send(result)
            }
        )
    },

    //回显考试答题情况
    get_showsituation: function(req, res, next) {
        exam_model.get_showsituation(req.query)
    },

    //显示该后台人员可查看的班级考试
    get_showgrade(req,res,next){
        exam_model.findgradeModel(req.userdata.uid, req.userdata.rid).then(response => {
            res.send(response)
        },err => {
            throw err;
        })
    },

    // 根据班级查看课程
    get_findclass: function(req, res, next) {
        let { gid } = req.query;
        exam_model.findclassModel(gid).then(
            result => {
                res.send(result)
            }, err => {
                throw(err)
            }
        )
    }   

}

module.exports = ExamControllers;