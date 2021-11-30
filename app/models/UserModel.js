const smsfn = require('../../libs/MySMSapi')
const smsjson = require('../../public/json/smsuser.json');
const fs = require('fs');
let UserModel = {
    /**
     * 
     * @param {object} data 传递进来后端获取数据做对比
     * @returns {object} 返回promise对象
     */
    post_loginModel: function (data,req) {
       
        return new Promise((reslove, reject) => {
            try {
                this.mydb.select('st_users,st_role', 
                ['st_users.phone', 'st_users.password', 'st_users.nickname','st_users.gid', 'st_users.uid', 'st_users.sex', 'st_users.token', 'st_users.head_img','st_role.rname', 'st_role.rid']
                , 'phone=? and st_users.rid=st_role.rid', [data.phone])
                    .then(
                        async res => {
                            let nickname = res[0].nickname;
                            let gid = res[0].gid;
                            let baseUrl = this.baseUrl;
                            let headimg = `${baseUrl}/img/userimg/`+res[0].head_img;
                            if (!headimg) {
                                headimg = 'default.jpg';
                            }
                            if (res instanceof Array && res.length == 0) {
                                reslove({
                                    code: 503,
                                    mes: 'user is null'
                                })
                            } else {
                                 
                                if (data.loginblo == 'true') {
                                    smsjson.forEach((one,key) => {
                                        
                                        if (one.phone == data.phone && one.smsnub == data.smsnub && Date.now() < one.yxtime) {
                                            let date = new Date();
                                            let datatime = date.getMonth() +1;
                                            if (datatime == 13) {
                                                datatime = 1;
                                            }
                                            let login_time = date.getFullYear() + '-' + datatime + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                                            try {
                                                this.mydb.alter('st_users', { 'token': Date.now(), 'login_time': login_time }, 'phone=?', [res[0].phone]);  //存入时间戳
                                            }catch(err) {
                                                throw err
                                            }finally{
                                                reslove({
                                                    code: 200,
                                                    mes: 'username and sms is ok',
                                                    data: {
                                                        phone: res[0].phone,
                                                        uid: res[0].uid,
                                                        tokentime: Date.now(),
                                                        rname: res[0].rname,
                                                        rid: res[0].rid,
                                                        nickname :nickname,
                                                        headimg : headimg,
                                                        gid : gid
                                                    }
                                                })
                                            }
                                            
                                        }
                                        if (key == smsjson.length-1) {
                                            reslove({
                                                code: 504,
                                                mes: 'sms is error '
                                            })
                                        }
                                    })
                                                                        
                                } else {
                                                        
                                    if (data.password == this.mycrypto.decryptedFn(res[0].password)) {
                                        let date = new Date();
                                        let datetime = date.getMonth()+1;
                                        if (datetime == 13) {
                                            datetime = 1
                                        }
                                        let login_time = date.getFullYear() + '-' + datetime + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                                        //存时间戳
                                        try {
                                            await this.mydb.alter('st_users', { 'token': Date.now(), 'login_time': login_time }, 'phone=?', [res[0].phone]);  //存入时间戳
                                        }catch(err) {
                                            throw err
                                        }finally{
                                            reslove({
                                                code: 200,
                                                mes: 'username and password is ok',
                                                data: {
                                                    phone: res[0].phone,
                                                    uid: res[0].uid,
                                                    tokentime: Date.now(),
                                                    rname: res[0].rname,
                                                    rid: res[0].rid,
                                                    nickname:nickname,
                                                    headimg : headimg,
                                                    gid : gid
                                                }
                                            })
                                        }
                                        
                                    } else {
                                        reslove({
                                            code: 504,
                                            mes: 'password is error ',
                                        })
                                    }
                                }
                            }
                        }
                    )
            } catch (err) {
                reject(err);
            }

        })
    },

    //短信接口
    post_lognsmsModel: function (phone, smsnub) {
        try {
            return new Promise((resolve, reject) => {
                let yxtime = Date.now() + 120000;
                smsfn(phone, smsnub).then(res => {
                    smsjson.push({
                        "phone": phone, smsnub: smsnub, yxtime: yxtime
                    })
                    fs.writeFileSync(__dirname + '/../../' + 'public/json/smsuser.json', JSON.stringify(smsjson, null, '\t'));
                    resolve({
                        code: 200,
                        mes: 'sms is request yes！',
                        data: [
                            {
                                'phone': phone,
                                'smsnub': smsnub,
                                'smstime': yxtime
                            }
                        ]
                    })
                }, err => reject(new Error('sms is error , please not Once again request')))
            })
        } catch (err) {
            reject(new Error('sms is error , please not Once again request'))
        }
    },

    //添加用户
    post_adduserModel: function (data,req) {

        return new Promise((resolve, reject) => {
            try {
                this.mydb.select('st_users', ['phone'], 'phone=?', [data.phone]).then(async res => {
                    if (res.length == 0 ) {  //
                        
                        await this.mydb.find('st_grades', ['gid', 'gname'], 'gname=?', [data.gname])
                        .then(resg => {
                            gradeid = resg['gid'];
                        }, err => {
                            reject(err);
                        }) 
                        if (!data.gid) {
                            data.gid = 0;
                        }
                        let date = new Date();
                        let datatime = date.getMonth()+1;
                        if (datatime == 13) {
                            datatime = 1
                        }
                        let sign_time = date.getMonth() + '-' + datatime + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                        let userdesc = {
                            'phone': data.phone,
                            'password': '23ae2a4f939f5dc33ae1022d14a0d395',
                            'sex': data.sex,
                            'rid': data.rid,
                            'nickname': data.nickname,
                            'gid': data.gid ,
                            'sign_time': sign_time,
                            'head_img':'default.jpg'
                        }
                                                
                        await this.mydb.add('st_users', userdesc).then(res => {
                            try {
                                this.addlog(req,{
                                    text:`添加手机号 :${data.phone} 昵称： ${data.nickname}的用户`,
                                    type : 1
                                })
                            }catch(err){
                                throw err
                                    
                            }finally{
                                resolve({
                                    code: 200,
                                    mes: 'add user ok！'
                                })
                            }
                            
                        })
                    } else {
                        resolve({
                            code: 507,
                            mes: 'user is exists！'
                        })
                    }
                })

            } catch (err) {
                resolve({
                    code: 507,
                    mes: 'user is exists！'
                })
                throw err;
            }
        })
    },

    //删除用户学生或教师
    post_deluserModel : function (data,req) {
        return new Promise(async (resolve,reject) =>{
            try {
                await this.select('st_users',['rid','phone'],'phone=?',[data.phone]).then(res => {
                    if  (res[0].rid == 1) {
                        resolve({
                            code : 4013,
                            mes : 'you is not power'
                        })
                    }
                })
                this.mydb.delete('st_users','phone=?',[data.phone]).then(
                    res => {
                        if (res.affectedRows == 0) {
                            resolve({
                                code:503,
                                mes:'username is  null'
                            })
                        }else {
                            try {
                                this.addlog(req,{
                                    text:`删除手机号 ：${data.phone}的用户`,
                                    type : 2
                                })
                            }catch(err){
                                throw err
                                    
                            } finally{
                                resolve({
                                    code : 200,
                                    mes:'delete username is ok'
                                })
                            }     
                           
                        }
                    },err => {reject(err)})
            }catch(err) {
                throw err
            }
        })
    },
    //修改用户
    post_alteruserModel : function(phone,data,req) {
        return new Promise((resolve,reject) => {
            try {
                this.mydb.select('st_users',['phone','rid'],'phone=?',[phone]).then(res => {
                    if (res.length == 0) {
                        resolve({
                            code : 503,
                            mes : 'user desc phone is not null'
                        })
                        return ;
                    }
                    res.forEach(item => {
                        if (item.rid == 1) {
                            resolve({
                                code : 4013,
                                mes : 'you is not power'
                            })
                        }
                    })
                
                   data.password = this.mycrypto.cryptedFn(String(data.password));
                   this.mydb.alter('st_users',data,'phone=?',[phone]).then(res => {
                       if (res.affectedRows != 0) {
                        try {
                            this.addlog(req,{
                                text:`修改了手机号为 ：${phone}的用户`,
                                type : 2
                            })
                        }catch(err){
                            throw err
                                
                        } finally{
                            resolve({
                                code:200,
                                mes:'user desc is update yes',
                                data : data
                            })
                        }  
                           
                       }else {
                            resolve({
                                code:505,
                                mes:'user desc alter is error'
                            })
                       }
                   },err => {
                       reject(err);
                   }) 
                    
                },err =>{
                    reject(err);
                })
                
            }catch(err) {
                throw err
            }
        })
    },
    
    //查找用户
    findModel(page,keyword) {
      
        return new Promise(async (resolve,reject) => {
            let item = 1;
            try {
                let sql = 'uid is not null';
                let sql2 = 'st_users.rid=st_role.rid';
                if (keyword) {
                    sql = `nickname like '%${keyword}%'`;
                    sql2 = `st_users.rid=st_role.rid and nickname like '%${keyword}%'`;
                }
                await this.mydb.select('st_users',['count(uid)'],sql)
                    .then(res => {
                        item = Math.ceil(Number((res[0]['count(uid)']))/10);
                    })
                    if (page >item) {
                        page = item;
                    }
                    if (page <= 0) {
                      page = 1;
                    }
                await this.mydb.select('st_users,st_role',
                    ['st_users.uid','st_users.phone','st_users.nickname','st_users.sex','st_role.rname']
                    ,sql2
                    ,[(page-1)*10],'ORDER BY st_users.rid asc',
                    'LIMIT ?,10').then(res => {
                    
                        resolve({
                            code : 200,
                            mes : 'user find the data',
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

    //获取头像列表
    getimg(){
        return new Promise((resolve,reject) => {
            try {
                this.myfs.promise_readdir('public/img/userimg').then(res => {
                    resolve({
                        code : 200,
                        mes : 'user the img is yes',
                        data:res.file
                    })
                })
            }catch(err) {
                reject(err);
            }
        })
    },

    //更换用户头像
    setimg(req) {
        let {imgsrc} = req.body; 
        let uid = req.userdata.uid;
        return new Promise((resolve,reject) => {
            this.getimg().then(res => {
                if (res.data.includes(imgsrc)){
                    this.mydb.alter('st_users',{"head_img":imgsrc},'uid=?',[uid]).then(res => {
                        if (res.affectedRows >0) {
                            resolve({
                                code : 200,
                                mes : 'user the headimg  ok'
                            })
                        }else {
                            resolve({
                                code : 505,
                                mes : 'is user the img is exists'
                            })
                        }
                    },err => {
                        reject(err);
                    } )
                }else {
                    resolve({
                        code : 505,
                        mes : 'is user the img is exists'
                    })
                }
            },err => {
                reject(err);
            }) 
        })
        

    },

    //获取用户信息 
    getpersonal(phone){
        return new Promise((resolve,reject) => {
            try {
                this.mydb.select('st_users',['uid','phone','nickname','sex'],'phone=?',[phone])
                .then(res => {
                    resolve({
                        code : 200,
                        mes : 'user the data',
                        data : res
                    })
                },err => {
                    reject(err);
                })
            }catch(err) {
                throw err
            }
        })
    },

    //单独就是修改密码
    alterpwd(phone,statpwd,updatepwd) {

        return new Promise(async (resolve,reject) => {
            try {
              await this.mydb.select('st_users','phone','phone = ?',[phone]).then(res => {
                if (res.length == 0) {
                    resolve({
                        code : 503,
                        mes : 'user desc phone is not null'
                    })
                    return ;
                }
               })
               if (updatepwd == 123456) {
                    updatepwd = this.mycrypto.cryptedFn(String(updatepwd));
                   this.mydb.alter('st_users',{password:`${updatepwd}`},'phone=?',[phone]).then(res => {
                        if (res.affectedRows != 0) {
                            resolve({
                                code : 200,
                                mes : 'user the password is ok',
                            })
                        }
                   },err => {
                       reject(err);
                   })
               }else {
                
                   updatepwd = this.mycrypto.cryptedFn(String(updatepwd));
                   statpwd = this.mycrypto.cryptedFn(String(statpwd))
                   await this.mydb.select('st_users','phone','phone=? and password=?',[phone,statpwd])
                   .then(res => {
                        if (res.length == 0) {
                            resolve({
                                code : 503,
                                mes : 'user desc phone is not null'
                            })
                        }else {
                            this.mydb.alter('st_users',{password:`${updatepwd}`},'phone=?',[phone]).then(res => {
                                if (res.affectedRows != 0) {
                                    resolve({
                                        code : 200,
                                        mes : 'user the password is ok',
                                    })
                                }
                           },err => {
                               reject(err);
                           })
                        } 
                   })
               }
               
            }catch(err) {
                reject(err);
            }
        })
    }

}

Object.setPrototypeOf(UserModel, require('./BaseModel'));

module.exports = UserModel;