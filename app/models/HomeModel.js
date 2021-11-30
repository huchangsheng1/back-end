const { response } = require('express');
const fs = require('fs');
let HomeModel = {
    
    //获取橱窗图
   
    setimgModel() {
        let baseUrl = this.baseUrl;
        return new Promise((resolve,reject) => {
            fs.readdir(__dirname+'/../../public/img/winimg',function(err,arr) {
                if (err) reject(err);
                arr.forEach((item,key) => {
                    arr[key] = `${baseUrl}/img/winimg/`+item
                })
                resolve({
                    code : 200,
                    mes : 'img is find desc',
                    data:arr
                })
            })
        })
    },
    
    //获取学生用户的班级和课程
    getstdescModel(req){
        let {phone,uid,rid,nickname,headimg} =  req.userdata;
        if (!rid == 4) {
            response.send({
                code : 400,
                mes : 'you is no student'
            })
        }

        return new Promise(async (resolve,reject) => {
            try {
                await this.mydb.select('st_users,st_grades,st_course',
                ['st_grades.*','st_course.*'],
                'st_users.uid=? and st_grades.gid=st_users.gid and st_course.gid=st_users.gid'
                ,[uid]).then(res => {
                    let baseUrl = this.baseUrl
                    res.forEach((item,key) => {
                        res[key].c_time = this.datetime(item.c_time);
                        res[key].start_time = this.datetime(item.start_time);
                        res[key].end_time = this.datetime(item.end_time);
                        res[key].course_time = this.datetime(item.course_time);
                        res[key].imgsrc = `${baseUrl}/resources/window_images/` + item.imgsrc
                    })
                    
                    resolve({
                        code : 200,
                        mes : 'student the desc is find ok',
                        data :{
                            userdata : {
                                phone
                                ,uid
                                ,nickname
                                ,headimg
                            },
                            course:res
                        }
                    },err => {
                        reject(err);
                    })
                })
            }catch(err) {
                reject(err);
            }
        })

    }

}


Object.setPrototypeOf(HomeModel, require('./BaseModel'));

module.exports = HomeModel;