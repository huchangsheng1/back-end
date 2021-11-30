let ForumModel = {

    //发表问题
    addaskModel(uid, course_id, ask_text) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.select('st_users,st_course', ['st_users.uid', 'st_course.course_id'],
                    'st_users.uid = ? and st_course.course_id =?',
                    [uid, course_id]
                ).then(res => {
                    if (res.length == 0) {
                        resolve({
                            code: 503,
                            mes: 'uid or course_id Do not conform to the'
                        })
                        return;
                    }
                    let date = new Date();
                   
                    let datafully = date.getMonth()+1;
                    if (datafully == 12) {
                        datafully = 1;
                    }
                    let ask_time = date.getFullYear() + '-' + datafully + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                    
                    let askobj = {
                        'uid': uid,
                        'course_id': course_id,
                        'ask_text': ask_text,
                        'ask_time': ask_time
                    }
                    this.mydb.add('st_ask', askobj).then(res => {
                        if (res.affectedRows > 0) {
                            resolve({
                                code: 200,
                                mes: 'ask is release success'
                            })
                        } else {
                            resolve({
                                code: 400,
                                mes: 'ask is post failure'
                            })
                        }
                    })
                }, err => {
                    reject(err);
                })
            } catch (err) {
                reject(err);
            }
        })
    },
    //回答问题
    addreplayModel(uid, replay_text, ask_key) {
        
        return new Promise((resolve, reject) => {
            try {
                this.mydb.select('st_users,st_ask', ['st_users.uid', 'st_ask.ask_key'],
                    'st_users.uid = ? and st_ask.ask_key = ?',
                    [uid, ask_key]
                ).then(res => {
                     
                    if (res.length == 0) {
                        resolve({
                            code: 503,
                            mes: 'uid or ask_key Do not conform to the'
                        })
                        return;
                    }
                    let date = new Date();
                    let datafully = date.getMonth()+1;
                   
                    if (datafully == 12) {
                        datafully = 1;
                    }
                    let replay_time = date.getFullYear() + '-' + datafully + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                    let replayobj = {
                        'uid': uid,
                        'replay_text': replay_text,
                        'ask_key': ask_key,
                        'replay_time': replay_time
                    }
                    this.mydb.add('st_replay', replayobj).then(res => {
                        if (res.affectedRows > 0) {
                            resolve({
                                code: 200,
                                mes: 'replay is release success'
                            })
                        } else {
                            resolve({
                                code: 400,
                                mes: 'replay is post failure'
                            })
                        }
                    })
                }, err => {
                    reject(err);
                })
            } catch (err) {
                reject(err);
            }
        })
    },
    //删除发布的问题,把回答都删除
    delaskModel(ask_key) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.delete('st_ask', 'ask_key=?', [ask_key])
                    .then(res => {
                        if (res.affectedRows > 0) {
                            this.mydb.delete('st_replay', 'ask_key=?', [ask_key]).then(res => {
                                resolve({
                                    code: 200,
                                    mes: 'delete ask is ok'
                                })
                            }, err => {
                                reject(err)
                            })
                        } else {
                            resolve({
                                code: 505,
                                mes: 'ask is exists'
                            })
                        }
                    })
            } catch (err) {
                reject(err);
            }

        })
    },
    //删除回答的问题
    delreplayModel(replay_key) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.delete('st_replay', 'replay_key=?', [replay_key])
                    .then(res => {
                        if (res.affectedRows > 0) {
                            resolve({
                                code: 200,
                                mes: 'delete replay_key is ok'
                            })
                        } else {
                            resolve({
                                code: 505,
                                mes: 'replay_key is exists'
                            })
                        }
                    })
            } catch (err) {
                reject(err);
            }

        })
    },
    //点击问题显示回复
    findreplayModel(ask_key) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.select('st_replay,st_users', ['st_replay.*', 'st_users.nickname','st_users.head_img'],
                    'st_replay.ask_key=? and st_users.uid=st_replay.uid',[ask_key])
                    .then(res => {
                        
                        let baseUrl = this.baseUrl;
                        for (let i=0; i<res.length ; i++ ) {
                            res[i].replay_time = this.datetime(res[i].replay_time);
                            res[i].head_img = `${baseUrl}/img/userimg/`+res[i].head_img;
                        }
                        resolve({
                            code : 200,
                            mes : 'ask the replay is desc ok',
                            data : res
                        })
                    })
            } catch (err) {
                reject(err);
            }
        })
    },
    //显示每次某某条
    selectaskModel(page,keyword,course_id){
        return new Promise(async (resolve,reject) => {
            let item = 1;
            let sql = 'st_users.uid = st_ask.uid and st_course.course_id = st_ask.course_id';
            let sql2 = 'st_course.course_id = st_ask.course_id';
            if (keyword) {
                sql = `st_users.uid = st_ask.uid and st_course.course_id = st_ask.course_id and st_ask.ask_text LIKE '%${keyword}%' `;
                sql2 = `st_course.course_id = st_ask.course_id and  ask_text LIKE '%${keyword}%'`;
            }
            if (course_id) {
                sql = `st_users.uid = st_ask.uid and st_course.course_id = st_ask.course_id and st_ask.course_id='${course_id}' `;
                sql2 = `st_course.course_id = st_ask.course_id and st_ask.course_id='${course_id}'`;
            }
            if (course_id && keyword) {
                sql = `st_users.uid = st_ask.uid and st_course.course_id = st_ask.course_id and st_ask.course_id='${course_id}' and st_ask.ask_text LIKE '%${keyword}%' `;
                sql2 = ` st_course.course_id = st_ask.course_id and st_ask.course_id='${course_id}' and st_ask.ask_text LIKE '%${keyword}%'`;
            }
            
            try {
                await this.mydb.find('st_ask,st_course',['count(ask_key)'],sql2)
                    .then(res => {
                        item = Math.ceil(Number(res['count(ask_key)'])/10);
                    },err => {
                        reject(err);
                    }) 
                if (page >item) {
                    page = item;
                }
                if (page <= 0) {
                    page = 1;
                }    

                await this.mydb.select('st_ask,st_users,st_course',[
                    'st_users.nickname','st_users.head_img','st_ask.*','st_course.course_name'
                ],sql,[(page-1)*10],
                'ORDER BY st_ask.ask_time DESC LIMIT ?,10')
                        .then(res =>  {
                            for(let i=0;i<res.length;i++){
                                res[i].ask_time = this.datetime( res[i].ask_time);
                                res[i].head_img = `${this.baseUrl}/img/userimg/`+res[i].head_img;
                            }
                            resolve({
                                code : 200,
                                mes : 'ask find the data',
                                data: {
                                    page:page,
                                    item:item,
                                    desc:res
                                }
                            })
                        },err => {
                            reject(err);
                        })

            }catch(err) {
                reject(err);
            }
            
           
    })
    },
    //通过题目编号请求回复的数量
    getaskcount(ask_key) {
        return new Promise((resolve,reject) => {
            try {
                this.mydb.find('st_replay',['count(ask_key or null)'],'ask_key=?',[ask_key])
                    .then(res => {
                        
                        resolve({
                            code : 200,
                            mes : 'ask up the replay is data  find ok',
                            data : res
                        },err => reject(err))
                    })
            }catch(err) {
                reject(err);
            }
        })
    }


}

Object.setPrototypeOf(ForumModel, require('./BaseModel'));

module.exports = ForumModel;