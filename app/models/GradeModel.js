const fs = require('fs');
const { myfs } = require('./BaseModel');
let GradeModel = {

    //创建班级
    createModel(gname, uid, gArr) {
        let date = new Date();
        let datatiem = date.getMonth()+1;
        if (datatiem = 13) {
            datatiem = 1
        }
        let c_time = date.getFullYear() + '-' + datatiem + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        return new Promise((resolve, reject) => {
            try {
                this.mydb.find('st_grades', ['gname'], 'gname=?', [gname])
                .then(
                    async res => {
                        if (res.gname) {
                            resolve({
                                code: 507,
                                mes: 'gname is exists!'
                            })
                            return;
                        }
                        this.mydb.add('st_grades', { 'gname': gname, 'gnub': gArr.length, 'uid': uid, 'c_time': c_time })
                            .then(async res => {
                                if (res.affectedRows <= 0) {
                                    resolve({
                                        code: 400,
                                        mes: 'add grades failure'
                                    })
                                    return;
                                }
                                
                                if (gArr.length == 0) {
                                    fs.mkdir(`${__dirname}/../../public/resources/netdisk/${gname}`,function(err){
                                        if (err) {
                                            reject(err);
                                        }else {
                                            resolve({
                                                code: 200,
                                                mes: 'grades is create yes'
                                            })
                                        }
                                    })     
                                }

                                //查询到添加班级完成的编号
                                await this.mydb.find('st_grades', ['gid'], 'gname=?', [gname])
                                .then(res => {
                                    let gid = res.gid;
                                    for (let i = 0; i < gArr.length; i++) {
                                        try {
                                            this.mydb.alter('st_users', { 'gid': gid }, 'uid =? and rid=4', [gArr[i]])
                                        } catch (err) {
                                            reject(err);
                                        }
                                        if (i == gArr.length-1) {
                                            //创建班级文件夹
                                            fs.mkdir(`${__dirname}/../../public/resources/netdisk/${gname}`,function(err){
                                                if (err) {
                                                    reject(err);
                                                }else {
                                                    resolve({
                                                        code: 200,
                                                        mes: 'grades is create yes'
                                                    })
                                                }
                                            })     
                                        }
                                    }
                                }, err => {
                                    reject(err);
                                })
                                                         
                                

                            }, err => {
                                reject(err);
                            })
                    }, err => {
                        reject(err);
                    }
                )
            } catch (err) {
                reject(err)
            }
        })
    },
    //解散班级
    delModel(gid) {
        return new Promise(async (resolve,reject) => {
            try{
               let gname = '';
               await this.mydb.find('st_grades',['gname'],'gid=?',[gid])
                    .then(res => {
                        if (res.gname) {
                            gname =  res.gname;
                        }else {
                            resolve({
                                code : 503,
                                mes : 'gname is null'
                            })
                        }
                    },err => {reject(err)}) 
                await this.mydb.delete('st_grades','gid=?',[gid])
                    .then(res => {
                        if (res.affectedRows <=0) {
                            resolve({
                                code: 503,
                                mes : 'grade is not exists'
                            })
                            return;
                        }
                        
                        this.mydb.alter('st_users',{'gid':0},'gid=?',[gid])
                        .then(res => {
                           if (this.myfs.promise_rmfile(`${__dirname}/../../public/resources/netdisk/${gname}`)){
                                resolve({
                                    code:200,
                                    mes : 'grade del ok '
                                })
                            }
                        },err => {
                            reject(err);
                        })
                    })
            }catch(err) {
                reject(err);
            }
        })
    },  
    //查询班级，默认显示所有班级,带分页
    findModel(page,keyword){
        
        return new Promise(async (resolve,reject) => {
          
         let item = 1;
         let sql = 'A.gid is not null';
         let sql2 = 'gid is not null';
         if (keyword) {
             sql2 = `st_grades.gname LIKE '%${keyword}%' `;
             sql = ` A.gname LIKE '%${keyword}%' `;
         }   
             try{
                 
                 await  this.mydb.find('st_grades',['count(gid)'],sql2).then(res => {
                     item = Math.ceil(res['count(gid)']/10);
                 },err => {reject(err)})  
                 if (page >item) {
                     page = item;
                 }
                 if (page <= 0) {
                   page = 1;
                 }
                 
                 await this.mydb.select('st_grades as A LEFT JOIN st_users as B ON B.gid = A.gid',
                             ['COUNT(B.gid) as "gstnub"','A.*','B.nickname']
                             ,sql,[(page-1)*10],'GROUP BY A.gid ',
                             'LIMIT ?,10').then(res => {
                                 for(let i=0;i<res.length ;i++) {
                                     res[i].c_time = this.datetime(res[i].c_time).substr(0,10);
                                 }
                                 
                                 resolve({
                                     code : 200,
                                     mes : 'grades find the data',
                                     data: {
                                         page:page,
                                         item:item,
                                         desc:res
                                     }
                                 })
                             },err => reject(err))
             }catch(err) {
                 reject(err);
             }
        })
     },
     
    //展示班级里面的学生
    showStModel(gid) {
        return new Promise((resolve,reject) => {
            try{
                this.mydb.select('st_users',['uid','phone','nickname','sex'],'gid=?',[gid])
                    .then(res => {
                        resolve({
                            code: 200,
                            mes : 'grade the students  desc',
                            data : res
                        },err => {
                            reject(err);
                        })
                    })
            }catch(err) {
                reject(err);
            }
        })
    },

    //批量添加学生进去班级
    addStModel(gid,uArr) {
        return new Promise((resolve,reject) => {
            try{
                this.mydb.find('st_grades',['gid','gnub'],'gid=?',[gid])
                    .then(async res => {
                        if (res.gid) {
                            for(let i=0; i<uArr.length ; i++) {
                                try {
                                    this.mydb.alter('st_users',{'gid':gid},'uid=?',[uArr[i]])
                                }catch(err) {
                                    reject(err);
                                }
                                if (i == uArr.length-1) {
                                    let unub = 0;
                                    await this.mydb.select('st_users',['count(gid)'],'gid=?',[gid])
                                        .then(res => {
                                            unub = res[0]['count(gid)'];
                                        },err => {
                                            reject(err);
                                        })
                                    await this.mydb.alter('st_grades',{'gnub':unub},'gid=?',[gid])
                                        .then(res => {
                                            resolve({
                                                code : 200,
                                                mes : 'student is add grades ok'
                                            })
                                        },err => {
                                            reject(err);
                                        })
                                }
                            }
                            
                        }else {
                            resolve({
                                code : 503,
                                mes : 'grades is null'
                            })
                            return;
                        }
                    },err => {
                        reject(err);
                    })
            }catch(err) {
                reject(err);
            }
        })
    },
    //单独或批量删除学生进入班级
    delStModel(gid,uArr){
        return new Promise((resolve,reject) => {
            try{
                this.mydb.find('st_grades',['gid','gnub'],'gid=?',[gid])
                    .then(async res => {
                        if (res.gid) {
                            for(let i=0; i<uArr.length ; i++) {
                                try {
                                    this.mydb.alter('st_users',{'gid':0},'uid=?',[uArr[i]])
                                }catch(err) {
                                    reject(err);
                                }
                                if (i == uArr.length-1) {
                                    let unub = 0;
                                    await this.mydb.select('st_users',['count(gid)'],'gid=?',[gid])
                                        .then(res => {
                                            unub = res[0]['count(gid)'];
                                        },err => {
                                            reject(err);
                                        })
                                    await this.mydb.alter('st_grades',{'gnub':unub},'gid=?',[gid])
                                        .then(res => {
                                            resolve({
                                                code : 200,
                                                mes : 'student is del grades ok'
                                            })
                                        },err => {
                                            reject(err);
                                        })
                                }
                            }
                            
                        }else {
                            resolve({
                                code : 503,
                                mes : 'grades is null'
                            })
                            return;
                        }
                    },err => {
                        reject(err);
                    })
            }catch(err) {
                reject(err);
            }
        })
    },

    //修改班级信息等
    alterModel(gid,gname,uid){
        return new Promise((resolve,reject) => {
            try {
                this.mydb.find('st_grades',['gid'],'gid=?',[gid])
                    .then(res => {
                        if (res.length == 0) {
                            resolve({
                                code : 503,
                                mes : 'grades is null'
                            })
                            return;
                        }
                        let obj = {};
                        if (gname) {
                            obj['gname'] = gname
                        }
                        if (uid) {
                            obj['uid'] = uid;
                        }
                        this.mydb.alter('st_grades',obj,'gid=?',[gid]).then(res => {
                            if (res.affectedRows >0) {
                                resolve({
                                    code : 200,
                                    mes : 'grades the desc is alter is ok'
                                })
                            }else {
                                resolve({
                                    code : 400,
                                    mes : 'grades the desc is alter error'
                                })
                            }
                        },err => {
                            reject(err);
                        })
                    },err => {
                        reject(err);
                    })
            }catch(err) {
                reject(err);
            }
        })
    },
    
    //通过班级id去获取该班级的所有课程
    getinfocourse(gid) {
        return new Promise((resolve,reject) => {
            try {
                this.mydb.select('st_course',['course_id','course_name'],'gid=?',[gid]).then(res => {
                    resolve({
                        code : 200,
                        mes : 'grade is the course data show',
                        data: res
                    },err => {
                        reject(err);
                    })
                })
            }catch(err) {
                reject(err);
            }
        })
    },

    //查询所有班级
    findgradeModel(){
        return new Promise(async (resolve,reject) => {
            
   
         let sql = 'st_users.uid = st_grades.uid';
         
             try{

                 await this.mydb.select('st_users,st_grades',
                    ['st_users.nickname','st_grades.gid','st_grades.gname'],sql
                    ).then(res => {
                        resolve({
                            code : 200,
                            mes : 'grades find the data',
                            data: res
                        })
                    },err => reject(err))
             }catch(err) {
                 reject(err);
             }
        })
     },

    


}



Object.setPrototypeOf(GradeModel, require('./BaseModel'));

module.exports = GradeModel;