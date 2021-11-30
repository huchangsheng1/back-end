const course_model = require('../models/CourseModel');

let CourseControllers = {
    //章节渲染
    get_foundchapters: function (req, res, next) {
        course_model.get_foundchapter(req.query.chapter_course_id).then(
            result => {
                res.send(result)
            }
        )
        
    },
    
    //课程渲染主页
    get_rendercourses: function (req, res, next) {
       

        course_model.get_rendercourses(req.query,req).then(
            result => {
                res.send(result)
            }
        )
        
    },

    //创建课程渲染
    get_renderfoundcourses: function (req, res, next) {
        course_model.get_renderfoundcourses().then(
            result => {
                res.send(result)
            },err => {
                throw err;
            }
        )
    },

    //橱窗图接口
    post_windowimage: function (req, res, next) {
        if (req.files.winimage == '' || req.files.winimage == undefined) {
            res.send({
                code:405,
                msg:'数据为空或undefined！',
                errmes:`TypeError: Data is empty in (${req.files.winimage})`
            })

        }else {
            res.send(course_model.post_windowimages(req.files.winimage))
        }
    },

    //编辑课程渲染
    get_rendereditcourses: function (req, res, next) {
        course_model.get_rendereditcourses(req.query.course_id).then(
            result => {
                res. send(result)
            }
        )
    },

    //编辑课程
    post_editcourses: function (req, res, next) {
        let editcourses_data = req.body
        console.log(editcourses_data);
        if (Object.values(editcourses_data).some((i) => i === undefined)) {
            res.send({
                code:404,
                msg:'创建失败,数据为空或undefined!',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
            
        }
        if (Object.values(editcourses_data).some((i) => i === '')) {
            res.send({
                code:404,
                msg:'创建失败,数据为空或undefined!',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
            
        }

        if(!Object.keys(editcourses_data)[0]) {
            res.send({
                code:404,
                msg:'创建失败,数据为空或undefined!',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
        }else{
            course_model.post_editcourses(req.body,req).then(
                result => {
                    res.send(result)
                }
            )
        }
        
    },

    //创建课程
    post_foundcourse: function (req, res, next) {
        let foundcourse_data = req.body
        if (Object.values(foundcourse_data).some((i) => i === undefined)) {
            res.send({
                code:404,
                msg:'创建失败,数据为空或undefined!',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
            
        }
        if (Object.values(foundcourse_data).some((i) => i === '')) {
            res.send({
                code:404,
                msg:'创建失败,数据为空或undefined!',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
            
        }
        if(!Object.keys(foundcourse_data)[0]) {
            res.send({
                code:404,
                msg:'创建失败,数据为空或undefined!',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
        }else{
            course_model.post_foundcourses(req.body).then(
                result => {
                    res.send(result)
                }
            )
        }
        
    },

    //删除课程
    post_deletecourses: function (req, res, next) {

        course_model.post_deletecourses(req.body).then(
            result => {
                res.send(result)
            }
        )
    },

    //创建章节
    post_foundchapter: function (req, res, next) {
        course_model.post_foundchapter(req.body).then(
            result => {
                console.log(result);
                res.send(result)
            }
        )

    },

    //编辑章节（渲染）
    get_editchapter : function (req, res, next) {

        course_model.get_editchapter(req.query).then(
            result => {
                res.send(result)
            }
            
        )

    },
    
    //编辑章节
    post_editchapter: function (req, res, next) {
        course_model.post_editchapter(req.body).then(
            result => {
                res.send(result)
            }
            
        )

    },

    //删除章节
    post_deletechapter: function (req, res, next) {
        course_model.post_deletechapter(req.body).then(
            result => {
                res.send(result)
            }
        )
    },

    //查询课程
    get_selectcourses: function(req, res, next){
        course_model.get_selectcourses(req.query,req).then(
            result => {
                res.send(result)
            }
        )
    },

    //节资源显示
    get_sectionresource: function (req, res, next) {

        course_model.get_sectionresource(req.query).then(
            result => {
                res.send(result)
            }
        ,err => {
            throw err;
        })
        
    },
    //课程信息单独渲染
    get_setcourse(req,res,next){
        let {course_id} = req.query;
        if (isNaN(Number(course_id))) {
            res.send({
                code : 400,
                mes : 'course_id is data typeof error'
            })
        }
        course_model.findresource(course_id).then(
            result => {
                res.send(result)
            }
        ,err => {
            throw err;
        })
    },

    //章节修改名称
    post_setchapter(req,res,next){
        let {chapter_id,chapter_name} = req.body;
        if (!/[0-9]+/.test(chapter_id) || !chapter_name) {
            res.send({
                code : 505,
                mes : 'you is pass the chapter_id or chapter_name is yichang'
            })
            return;
        }
        course_model.setchapterModel(chapter_id,chapter_name).then(response => {
            res.send(response);
        },err => {
            throw err;
        })
    },

    //添加节
    post_addsection(req, res, next) {

        console.log(req.body);
        course_model.addsection(req.body).then(
            result => {
                res.send(result)
            }
        )
    },

    //上传节资源
    post_uploadresources(req, res, next) {

        course_model.uploadresources(req.body).then(
            result => {
                res.send(result)
            }
        )
    }

    

}

module.exports = CourseControllers;