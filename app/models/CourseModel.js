const string_random = require('string-random');
const fs = require('fs');
const path = require('path');
const { mydb } = require('./BaseModel');
const sd = require('silly-datetime');   //获取当前时间
const page_turning_class = require('../../libs/Pages');



 let coursemodel = {
     //章节数据渲染
    get_foundchapter: function (foundcourses_data) { 
        try{
            return new Promise((reslove, reject) => {
               
                if (!foundcourses_data) {
                    reslove({
                        code:400,
                        msg: '请求数据错误！',
                        errmes: `Request data error in (${foundcourses_data})`
                    })
                }
                mydb.find('st_chapter',['chapter_course_id'], 'chapter_course_id=?', [foundcourses_data]).then(
                    result => {
                  
                        if(!result.chapter_course_id){
                            reslove({
                                code:401,
                                msg:'改课程还没有章节!',
                                errmes:`Courses that do not exist in (${foundcourses_data})`
                            })
                        }
                        mydb.select('st_chapter', ['chapter_id','chapter_name', 'chapter_key', 'chapter_sort'], 'chapter_course_id=?', [foundcourses_data]).then(
                            result => {
                         
                                reslove(result)
                                    
                            }
                        )
                    }
                )
            });
        } catch(err) {
            if(err) throw err;
        } 
    },

    //课程数据渲染(教师学生管理员教务适配)
    get_rendercourses: function (rendercourses_data,req) {
        try{
            
            return new Promise( (reslove, reject) => {
                let uid = req.userdata.uid, rid = req.userdata.rid;
                
                let tableName = 'st_course, st_grades, st_users';
                let condition = '';
                let selectcourses_data = ['course_id', 'course_name', 'start_time', 'end_time', 'imgsrc', 'descs', 'gname', 'gnub', 'nickname'];
                let params = [uid];
                if (rid == 1 || rid == 2) {
                    condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid `;
                }else if (rid == 4) {
                    condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid  AND st_course.gid=?`;
                    params = [req.userdata.gid]
                }else if (rid == 3){
                    tableName = 'st_course, st_grades';
                    condition = `st_course.gid=st_grades.gid AND st_course.uid=?`;
                    selectcourses_data = ['course_id', 'course_name', 'start_time', 'end_time', 'imgsrc', 'descs', 'gname', 'gnub'];
                    params = [uid];
                }

                
                let pagesize = 10;   //每页显示数量
           
                let aa = (Number(rendercourses_data.page) - 1) * pagesize
                

                mydb.select(tableName, [`COUNT(course_id) AS ${'dataCount'}`],condition,params).then(
                    resultdataCount => {
                        
                       
                        if (rid == 1 || rid == 2) {
                            condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid LIMIT ${aa},${pagesize}`;

                        }else if (rid == 4) {
                           
                            condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid  AND st_course.gid=? LIMIT ${aa},${pagesize}`;
                            params = [req.userdata.gid]
                        }else if (rid == 3){
                            tableName = 'st_course, st_grades';
                            condition = `st_course.gid=st_grades.gid AND st_course.uid=? LIMIT ${aa},${pagesize}`;
                            selectcourses_data = ['course_id', 'course_name', 'start_time', 'end_time', 'imgsrc', 'descs', 'gname', 'gnub'];
                            params = [uid];
                        }

                        mydb.select(tableName, selectcourses_data, condition, params).then(
                            async result => {
                                  if(!result[0]) {
                                      reslove({
                                          code:200,
                                          msg:'没有课程'
                                      })
                                  }
                                  
                                 for(let i = 0; i < result.length; i++){
                                  await mydb.select('st_chapter', 
                                      [`COUNT(st_chapter.chapter_course_id=? AND st_chapter.chapter_key > 0 or null) AS ${'section'}`, 
                                      `COUNT(st_chapter.chapter_course_id=? AND st_chapter.chapter_key=0 or null)AS ${'chapter'}`], 'chapter_id IS NOT NULL',
                                      [result[i].course_id, result[i].course_id]).then(
                                          resultCount => {
                                                
                                          result[i]['section'] =  resultCount[0].section
                                          result[i]['chapter'] =   resultCount[0].chapter
                                              if(result.length-1 == i){
                                                let baseUrl = this.baseUrl;
                                                  result.forEach((item,key) => {
                                                    result[key].start_time = this.datetime(item.start_time).substr(0,9).trim();
                                                    result[key].end_time = this.datetime(item.end_time).substr(0,9).trim();
                                                    result[key].imgsrc =  `${baseUrl}/resources/window_images/`+item.imgsrc
                                                  })
                                                  
                                                  let pagetall = resultdataCount[0].dataCount;
                                                      
                                                  reslove({
                                                      code: 200,
                                                      msg: 'ok',
                                                      data: result,
                                                      turnpages: Math.ceil(pagetall/pagesize)
                                                  })
                                              }
                                          
                                          }      
                                          
                                      )
                                  }
                                  
                                  
                                  
                                  
                              }
                              
                          )

                    }
                )

               
            })
        } catch (err) {
            if (err) throw err;
        }  
    },

    //橱窗图接口
    post_windowimages: function (window_images_data){
        try{
            let window_images_type = ['image/png', 'image/jpg']
            let window_images_name = string_random(10) + window_images_data.name;
    
            if (window_images_type.indexOf(window_images_data.type) < 0) {
                return  {
                    code:401,
                    msg:'暂不支持此格式！',
                    errmes:`This format is not supported at this time in (${window_images_data.type})`
                }
            } else if (window_images_data.size > 50000) {
                return {
                    code:402,
                    msg:'文件过大！',
                    errmes:`The file is too large in (${window_images_data.size})`
                }
            }
            
            fs.createReadStream(window_images_data.path)
            .pipe(fs.createWriteStream(path.join(__dirname, '../../public/resources/window_images/', window_images_name)))
            return {
                code:200,
                msg:'ok',
                // data:[
                    // {
                        imagesrc: 'http://localhost:3000/resources/window_images/'+ window_images_name,
                        imgname: window_images_name
                    // }
                // ]
            } 
        } catch(err){
            if (err) throw err;
        }
        
        
    },

    //创建课程渲染(已有班级)
    get_renderfoundcourses: function () {
        try{
            return new Promise((reslove, reject) => {
                mydb.select('st_grades', ['gid', 'gname'], 'gid IS NOT NULL').then(
                    result => {
                        reslove({
                            code : 200,
                            mes : 'grabe is data show',
                            data : result
                        })
                    },err => {
                        reject(err);
                    }
                )
            })
           
        } catch (err) {
            if (err) throw err;

        }
        
    },

    //编辑课程渲染(回显)
    get_rendereditcourses: function (rendereditcourses_data){
 
        try{
            return new Promise((reslove, reject) => {
                mydb.find('st_course', ['course_name','gid','start_time','end_time','imgsrc','descs'], 'course_id=?',[rendereditcourses_data])
                .then(
                    result => {
                        let baseUrl = this.baseUrl;
                        result.imgsrc = `${baseUrl}/resources/window_images/`+result.imgsrc;
                        result.start_time = this.datetime(result.start_time).substr(0,10).trim(); 
                        result.end_time = this.datetime(result.end_time).substr(0,10).trim(); 
                        reslove({
                            code : 200,
                            mes : 'you is get the data is show',
                            data : result
                        })
                    },err => {
                        throw err
                    }
                )
            })

        } catch (err) {
            if (err) throw err;
        }
    },

    //编辑课程
    post_editcourses: function (courses_data,req) {
        try{
            let resultlist = [
                {code:400, msg:`该班已经有此课程！`, errmes:`This class already has this course in ('${courses_data.course_name})'`},
                {code:401, msg:'编辑失败', errmes:`The edited course does not exist in ('${courses_data.course_name})'`},
            ]
            return new Promise((reslove, reject) => {
                mydb.find('st_grades', ['gid'], 'gname=?', [courses_data.gname]).then(
                    res  => {
                    let gid = res.gid;       //当前班级id
                    let uid = req.userdata.uid          //token验证(待改)<解析token获取>
                    
                    
                    let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');  //当前时间
                    mydb.find('st_course', ['gid', 'course_name'], 'gid=? AND course_name=?', [gid, courses_data.course_name]).then(
                        res => {
                            if (res.gid) {
                                reslove(resultlist[0])
                            } else {
                                let data = {
                                    'course_name':courses_data.course_name,
                                    // 'gid':gid,
                                    'start_time':courses_data.start_time,
                                    'end_time':courses_data.end_time,
                                    'uid':uid,
                                    'imgsrc':courses_data.imgsrc,
                                    'descs':courses_data.descs,
                                    'course_time':updatetimes
                                }
                               
                                mydb.alter('st_course',data,'course_id=?', [courses_data.course_id]).then(
                                    res => {
                                  
                                        if (res.affectedRows == 1) {
                                            reslove({
                                                code:200,
                                                msg:'ok',
                                            })  
                                        } else {
                                            reslove(resultlist[1])
                                        }
                                    }
                                )
                               
                            }
                              
                        }
                    )
                    
                }
            )


            });

        } catch (err) {
            if (err) throw err;
        }
    },

    //创建课程
    post_foundcourses: function (courses_data) {
        try{
            return new Promise((resolve,reject) => {
                let resultlist = [
                    {code:400, msg:`该班已经有此课程！`, errmes:`This class already has this course in ('${courses_data.course_name})'`},
                    {code:401, msg:'创建失败', errmes:`Failed to create course in ('${courses_data.course_name})'`},
                ]
            
                //班级id获取
                mydb.find('st_grades', ['gid'], 'gname=?', [courses_data.gname]).then(
                        res  => {
                        let gid = res.gid;       //当前班级id
                        let uid = '1';          //token验证(待改)<解析token获取>
                        
                      
                        let updatetimes = sd.format(new Date(), 'YYYY-MM-DD');  //当前时间
                        mydb.find('st_course', ['gid', 'course_name'], 'gid=? AND course_name=?', [gid, courses_data.course_name]).then(
                            res => {
                                if (res.gid) {
                                    resolve(resultlist[0])
                                } else {
                                    let data = {
                                        'course_name':courses_data.course_name,
                                        'gid':gid,
                                        'start_time':courses_data.start_time,
                                        'end_time':courses_data.end_time,
                                        'uid':uid,
                                        'imgsrc':courses_data.imgsrc,
                                        'descs':courses_data.descs,
                                        'course_time':updatetimes
                                    }
                                    mydb.add('st_course',data).then(
                                        res => {
                                            if (res) {
    
                                                resolve({
                                                    code:200,
                                                    msg:'ok',
                                                })  
                                            } else {
                                                resolve(resultlist[1])
                                            }
                                        }
                                    )
                                   
                                }
                                  
                            }
                        )
                        
                    }
                )
            });
        } catch(err){
            if (err) throw err;
        }
        
        
        

     
    },

    //删除课程
    post_deletecourses: function (courses_data) {
        try{
            return new Promise((resolve,reject) => {
                mydb.delete('st_course', 'course_id=?', [courses_data.course_id]).then(
                    result => {
                 
                        if (result.affectedRows == 0) {
                            resolve({
                                code:400,
                                msg:'删除失败!',
                                errmes:`Courses that do not exist in (${courses_data.course_id})`
                            })
                        }
                        mydb.select('st_chapter',['chapter_id'], 'chapter_course_id=?', [courses_data.course_id]).then(
                            result => {
                            
                                result.forEach((val) => {
                                    
                                    mydb.delete('st_resources','chapter_id=?',[val.chapter_id])
                                })

                                mydb.delete('st_chapter', 'chapter_course_id=?', [courses_data.course_id]).then(
                                    result => {
                                        if (result) {
                                            resolve({
                                                code:200,
                                                msg:'ok!'
                                            })
                                        }     
                                        
                                    }
                                )
                            }
                        )   
                        
                    }
                )
            })
        } catch(err){
            if(err) throw err;
        }
        
        
    },


    //查询课程
    get_selectcourses: function (rendercourses_data,req) {
        
        try{
            return new Promise((reslove, reject) => {
                let uid = req.userdata.uid, rid = req.userdata.rid;
                let tableName = 'st_course, st_grades, st_users';
                let condition = '';
                let selectcourses_data = ['course_id', 'course_name', 'start_time', 'end_time', 'imgsrc', 'descs', 'gname', 'gnub', 'nickname'];
                let params = [uid];
                if (rid == 1 || rid == 2) {
                    condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid AND course_name LIKE '%${rendercourses_data.keyword}%'`;
                }else if (rid == 4) {
                    condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid  AND st_course.gid=? AND course_name LIKE '%${rendercourses_data.keyword}%'`;
                    params = [rendercourses_data.gid]
                }else if (rid == 3){
                    tableName = 'st_course, st_grades';
                    condition = `st_course.gid=st_grades.gid AND st_course.uid=? AND course_name LIKE '%${rendercourses_data.keyword}%'`;
                    selectcourses_data = ['course_id', 'course_name', 'start_time', 'end_time', 'imgsrc', 'descs', 'gname', 'gnub'];
                    params = [uid];
                }


                
                let pagesize = 2;   //每页显示数量
                let aa = (Number(rendercourses_data.page) - 1) * pagesize
                

                mydb.select(tableName, [`COUNT(course_id) AS ${'dataCount'}`],condition,params).then(
                    resultdataCount => {
                        
                        if (rid == 1 || rid == 2) {
                            condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid AND course_name LIKE '%${rendercourses_data.keyword}%' LIMIT ${aa},${pagesize}`;

                        }else if (rid == 4) {
                            
                            condition = `st_course.gid=st_grades.gid AND st_course.uid=st_users.uid  AND st_course.gid=? AND course_name LIKE '%${rendercourses_data.keyword}%' LIMIT ${aa},${pagesize}`;
                            params = [Number(rendercourses_data.gid)]
                        }else if (rid == 3){
                            tableName = 'st_course, st_grades';
                            condition = `st_course.gid=st_grades.gid AND st_course.uid=? AND course_name LIKE '%${rendercourses_data.keyword}%' LIMIT ${aa},${pagesize}`;
                            selectcourses_data = ['course_id', 'course_name', 'start_time', 'end_time', 'imgsrc', 'descs', 'gname', 'gnub'];
                            params = [Number(uid)];
                        }
                        
                        mydb.select(tableName, selectcourses_data, condition, params).then(
                            async result => {
                                  
                                  if(!result[0]) {
                                      reslove({
                                          code:200,
                                          msg:'没有课程'
                                      })
                                  }
                                  
                                 for(let i = 0; i < result.length; i++){
                                  await mydb.select('st_chapter', 
                                      [`COUNT(st_chapter.chapter_course_id=? AND st_chapter.chapter_key > 0 or null) AS ${'section'}`, 
                                      `COUNT(st_chapter.chapter_course_id=? AND st_chapter.chapter_key=0 or null)AS ${'chapter'}`], 'chapter_id IS NOT NULL',
                                      [result[i].course_id, result[i].course_id]).then(
                                          resultCount => {
                                                
          
                                          result[i]['section'] =  resultCount[0].section
                                          result[i]['chapter'] =   resultCount[0].chapter
                                              if(result.length-1 == i){
                                                let baseUrl = this.baseUrl;
                                                result.forEach((item,key) => {
                                                    result[key].start_time = this.datetime(item.start_time).substr(0,10).trim();
                                                    result[key].end_time = this.datetime(item.end_time).substr(0,10).trim();
                                                    result[key].imgsrc = `${baseUrl}/resources/window_images/` +item.imgsrc    
                                                })
                                                  reslove({
                                                      code: 200,
                                                      msg: 'ok',
                                                      data: result,
                                                      turnpages: page_turning_class.Easy_classification(pagesize, resultdataCount[0].dataCount, rendercourses_data.page, rendercourses_data.keyword)
                                                  })
                                              }
                                          
                                          }      
                                          
                                      )
                                  }
                                  
                                  
                                  
                                  
                              }
                              
                          )

                    }
                )



            })



        } catch (err) {
            if (err) throw err;

        }
    },


    //创建章
    post_foundchapter: function (chapter_data) {
    
        try{
            return new Promise(async (resolve, reject) => {
                let chapter = [];   //章id
                let section = [];   //节
                const chapter_course_id_value = chapter_data[0].chapter_course_id;
                for(let i = 0;i < chapter_data.length;i++){
                 
                   await mydb.add('st_chapter', {chapter_name:chapter_data[i].chapter_name, chapter_course_id:chapter_course_id_value,chapter_sort:chapter_data[i].chapter_sort}).then(
                        result => {
                            chapter.push(result.insertId)
                            section.push(chapter_data[i].section_set)  
                        }
                      )
                               
                }
               

                if (chapter.length != section.length) {
                    resolve({
                        code:400,
                        msg:'请求失败',
                        errmes:`Section does not correspond!`
                    })
                }

                section.forEach((val, key) => {
                    val.forEach(async (once) => {
                        const {insertId} = await mydb.add('st_chapter', {
                            chapter_name:once.section_name,
                            chapter_key:chapter[key],
                            chapter_course_id:chapter_course_id_value,
                            chapter_sort:once.chapter_sort
                        });

                        for(let i = 0;i < once.src.length;i++){
                            let resources_ext = once.src[i].substr(once.src[i].lastIndexOf('.'));
                            let scrnub = 1;
                            if (resources_ext == '.mp4') {
                                scrnub = 0;
                            }
                            mydb.add('st_resources', {
                                chapter_id:insertId,
                                src:once.src[i],
                                scrnub,
                                upload_time: Date.now()
                            })
                        }
                     resolve({
                                code:200,
                                msg:'ok'
                            })
                    })
                })
    
            })
        } catch(err){
            if(err) throw err;

        }
        
    },

    //编辑章节渲染
    get_editchapter: function (editchapter_data) {
        try{
            return new  Promise((reslove, reject) => {
                
                mydb.select('st_chapter',['chapter_id', 'chapter_course_id', 'chapter_name', 'chapter_sort','chapter_key'],
                'chapter_course_id=?', [editchapter_data.chapter_course_id])
                .then(
                    result => {
                        if(!result[0]){
                            reslove({
                                code: 400,
                                msg: '该课程还没有章节'
                            })
                        }
                        
                        reslove(result)
                    }
                )
            })


        } catch (err) {

            throw err


        }




    },


    //编辑章节
    post_editchapter: function (chapter_data) {
        try{
            return new Promise(async (resolve, reject) => {
                let chapter = [];   //章id
                let section = []    //节
                const chapter_course_id_value = chapter_data[0].chapter_course_id;
                for(let i = 0;i < chapter_data.length;i++){
                   
                    await mydb.alter('st_chapter', {chapter_name:chapter_data[i].chapter_name},
                   'chapter_course_id=? AND chapter_id=?',[chapter_course_id_value,chapter_data[i].chapter_id]).then(
                        result => {
                        
                            chapter.push(chapter_data[i].chapter_id)
                            section.push(chapter_data[i].section_set)  
                        }
                      )
                               
                }
                

                if (chapter.length != section.length) {
                    resolve({
                        code:400,
                        msg:'请求失败',
                        errmes:`Section does not correspond!`
                    })
                }

                section.forEach((val, key) => {
                    val.forEach(async (once) => {
                        await mydb.alter('st_chapter', {
                            chapter_name:once.section_name,
                            chapter_key:chapter[key],
                            chapter_course_id:chapter_course_id_value
                        },'chapter_course_id=? AND chapter_id=?',[chapter_course_id_value,once.chapter_id]);

                        for(let i = 0;i < once.src.length;i++){
                            let resources_ext = once.src[i].substr(once.src[i].lastIndexOf('.'));
                            let scrnub = 1;
                            if (resources_ext == '.mp4') {
                                scrnub = 0;
                            }
                     
                            mydb.alter('st_resources', {
                                // chapter_id:once.chapter_id,
                                src:once.src[i],
                                scrnub,
                                upload_time: Date.now()
                            },'chapter_id=?',[once.chapter_id])
                        }
                     resolve({
                                code:200,
                                msg:'ok'
                            })
                    })
                })               

            })

        } catch (err) {
            if (err) throw err;
        }



    },

    //删除章节
    post_deletechapter: function (deletechapter_data) {
        try{
            return new  Promise((reslove, reject) => {
                mydb.delete('st_chapter', 'chapter_id=? AND chapter_course_id=?',
                [deletechapter_data.chapter_id, deletechapter_data.chapter_course_id]).then(
                    result => {
                
                        if (result.affectedRows == 1) {
                            mydb.delete('st_resources', 'chapter_id=?', [deletechapter_data.chapter_id]).then(
                                result => {
                                    if (result) {
                                        reslove({
                                            code: 200,
                                            msg: 'ok'
                                        })
                                    }
                                
                                }
                            )
                        } else {
                            reslove({
                                code:400,
                                msg: '该章节不存在!',
                                errmes: `Chapter does not exist in (${deletechapter_data.chapter_id})`
                            })
                        }
                    }
                )

            });

        } catch (err) {
            if (err) throw err;
        }


    },

    //节资源
    get_sectionresource: function (sectionresource_data) {      
   
        try{
            return new Promise((resolve, reject) => {

                mydb.select('st_resources',
                ['resources_key','src', 'scrnub'],
                'chapter_id=?',[sectionresource_data.chapter_id])
                .then(
                    result => {
                   
                        let pptarr = [],
                            videoarr = [];
                        result.forEach((val,key) => {
                           if (val.scrnub == 1) {
                            result[key]['srcname'] = val.src;
                            let baseUrl = this.baseUrl;
                            pptarr.push({
                                'resources_key': result[key]['resources_key'],
                                'srcname' : result[key]['srcname'],
                                'src':`${baseUrl}/resources/ppt/` + val.src
                            })
                           }
                           if (val.scrnub == 0) {
                            result[key]['srcname'] = val.src;
                            let baseUrl = this.baseUrl;
                            videoarr.push({
                                'resources_key': result[key]['resources_key'],
                                'srcname' : result[key]['srcname'],
                                'src':`${baseUrl}/resources/video/` + val.src
                            })
                           }
                        }),
                        resolve({
                            code : 200,
                            mes : 'resources is find data is up',
                            data : {
                                'ppt' : pptarr,
                                'video' : videoarr
                            }
                        })
                    }
                )
            });

        } catch (err) {
            if (err) throw err;
        }



    },

      //修改章节名称
    setchapterModel(chapter_id,chapter_name){
        return new Promise((resolve,reject) => {
            try{
              this.mydb.alter('st_chapter',{'chapter_name':chapter_name},'chapter_id=?',[chapter_id])
                 .then(res => {
                     if (res.affectedRows > 0) {
                         resolve({
                             code : 200,
                             mes : 'chapter_name is updata ok'
                         })
                     }else {
                         resolve({
                             code : 403,
                             mes : 'chapter_name is updata error'
                         })
                     }
                 },err => {
                     reject(err);
                 })
            }catch(err) {
                reject(err);
            }
        })
     },


     //添加节
     addsection(addsectiondata) {
        try{
            return new Promise( (resolve, reject) => {

                addsectiondata.forEach((val) => {

                    mydb.add('st_chapter', {
                        chapter_name:val.section_name,
                        chapter_course_id:val.chapter_course_id, 
                        chapter_sort:val.chapter_sort, 
                        chapter_key: val.chapter_key
                    }).then(
                        result => {
            

                           resolve({
                               code: 200,
                               msg: 'ok'
                           })
                        }
                      )


                })
               
                    

            })
        } catch(err){
            if(err) throw err;

        }


     },


     //上传节资源
     uploadresources(uploadresources) {
  
        try{
            return new Promise( (resolve, reject) => {

              uploadresources.src.forEach((val) => {
                    let resources_ext = val.substr(val.lastIndexOf('.'));
                    let scrnub = 1;
                    if (resources_ext == '.mp4') {
                        scrnub = 0;
                    }
                    mydb.add('st_resources', {
                        chapter_id:uploadresources.chapter_id,
                        src:val,
                        scrnub,
                        upload_time: Date.now()
                    }).then(
                        res => {
                
    
                            resolve({
                                code: 200,
                                msg: 'ok'
                            })
                        }
                    )
    



              })

                
                

            })
        } catch(err){
            if(err) throw err;

        }

        




     },
     
    


    

    

    //获取单独一门课程所有信息
    findresource(course_id) {
       return new Promise((resolve,reject) => {
           try{
              this.mydb.select('st_course,st_users,st_grades',
             ['st_course.*','st_grades.gname','st_users.nickname'],
             'st_course.uid=st_users.uid and st_course.course_id=? and st_course.gid=st_grades.gid'
             ,[course_id]).then(result => {
                let baseUrl = this.baseUrl;
                result.forEach((item,key) => {
                    result[key].start_time = this.datetime(item.start_time).substr(0,10).trim();
                    result[key].end_time = this.datetime(item.end_time).substr(0,10).trim();  
                    result[key].course_time = this.datetime(item.course_time).substr(0,10).trim();  
                    result[key].imgsrc =  `${baseUrl}/resources/window_images/`+item.imgsrc
                })
                resolve({
                      code : 200,
                      mes : 'course is find ok ',
                      data : result
                  })
              },err => {
                reject(err)
            })
           }catch(err) {
                reject(err);
           }
       })
    },

    //修改章节名称
    setchapterModel(chapter_id,chapter_name){
       return new Promise((resolve,reject) => {
           try{
             this.mydb.alter('st_chapter',{'chapter_name':chapter_name},'chapter_id=?',[chapter_id])
                .then(res => {
                    if (res.affectedRows > 0) {
                        resolve({
                            code : 200,
                            mes : 'chapter_name is updata ok'
                        })
                    }else {
                        resolve({
                            code : 403,
                            mes : 'chapter_name is updata error'
                        })
                    }
                },err => {
                    reject(err);
                })
           }catch(err) {
               reject(err);
           }
       })
    }
    

}
Object.setPrototypeOf(coursemodel, require('./BaseModel'));
module.exports = coursemodel;