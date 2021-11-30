
const task_model = require('../models/TaskModel');
const { json } = require('express');

module.exports = {
    //Excel 上传
    post_xlex: function (req, res, next) {
        task_model.read_xlse(req)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },

    //发布作业*
    /**
     * 
     * @param {string} tid_json 作业题目
     * @param {string} course 课程
     * @param {number} courseID 课程id
     * @param {number} end_time 截止时间
     * @param {number} full 满分
     * 
     */
    post_upjob: function(req, res, next){
        let tid_json = req.body.task;
        let course = req.body.course, 
            courseID = req.body.courseID,
            end_time = req.body.end_time,
            full =req.body.full,
            codes = req.body.codes
        // console.log(req.body.task)
        task_model.read_task(tid_json,course, courseID,end_time,full,codes)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },
    //发布作业前获得老师名下的课程
    get_classname: function (req, res, next){
        task_model.WriteClassname(req)
        .then(
            result => {
                res.send(JSON.stringify(result))
            }
        )
    },
    //删除作业*
    post_delwork: function (req, res, next) {
        let work_nub = req.body.work_nub
        task_model.del_work(work_nub)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },
    //学生查看对应作业的内容*
    get_viewhomework :function (req, res, next){
        let work_nub = req.query.test_key;//作业编号
        let course_id = req.query.course_id;//课程id
        if( work_nub =='' || course_id ==''){
            res.send(json.stringify({
                code:400,
                mse:'teacherID or courseID is null'
            }))
        }
        task_model.view_homework(work_nub,course_id)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },
    //学生查看提交过的作业内容*
    get_modifywork : function (req,res,next){
        let uid = req.userdata.uid;
        let tid = req.query.test_key;
        let course_id = req.query.course_id
      
        task_model.modify_work(uid,tid,course_id)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
        
    },

    //学生查看教师发布的课程的所有作业*
    get_teacherworks : function (req,res,next) {
        let nowtime = req.query.nowtime;
        let course_id = req.query.course_id;
        let uid = req.query.uid;
        // console.log(req.query)
        task_model.TeacherWorkLook(course_id,nowtime,uid)
            .then(
                result => {
              
                    res.send(JSON.stringify(result))
                }
            )
    },

    //学生提交作业/学生修改完作业提交*
    post_viewhomework :function (req, res, next){
        task_model.HeadOverWork(req)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },

    //学生查询写完作业*
    get_lookwork:function(req, res, next){
        
        task_model.Lookwork(req)
        .then(
            result => {
                res.send(JSON.stringify(result))
            }
        )
    },

     //教师查看对应单科作业
     get_teacherlook : function(req,res,next){
        let work_nub = req.body.work_nub,
        course_id = req.body.course_id
        task_model.TeacherLook(work_nub,course_id,work_name)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },

    //教师查看自己发的作业*
    get_teacherwork:function (req,res,next){
        task_model.TeacherWork(req)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
            
    },

    //教师查看每个学生的作业内容
    get_correctingwork:function(req,res,next){
        task_model.CorrectingWork(req)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },

    //教师查看每个学生的作业内容
    get_teacherlookwork:function (req,res,next){
        task_model.TeacherLookWork(req)
        .then(
            result => {
                res.send(JSON.stringify(result))
            }
        )
    },
    //教师批改作业
    get_teachercorrect:function (req,res,next) {
        task_model.TeacherCorrect(req)
            .then(
                result => {
                    res.send(JSON.stringify(result))
                }
            )
    },

}