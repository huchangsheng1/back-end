const { mydb } = require('./BaseModel');
const sd = require('silly-datetime');

let questionDB = {
    //题库渲染
    get_index: function (page,keyword,uid,rid) {
        try {
            page = parseInt(page);
            if (isNaN(page)) page = 1;
            
            return new Promise(async (resolve, reject) => {
                //模糊查询
                let search = ''
                if (keyword) {
                    search = `AND t_names LIKE '%${keyword}%'`
                }                
                
                if (rid == 1 || rid == 2) {
                    //取题库中数据
                    let item = 1;
                    let t_length = await this.mydb.select('st_topic', '*', `tid IS NOT NULL ${search}`); 
                    
                    item = Math.ceil(Number(t_length.length)/10);
                  
                    if (page >item) {
                        page = item;
                    }
                    if (page <= 0) {
                      page = 1;
                    }
                    let topics = await this.mydb.select('st_topic', '*', `tid IS NOT NULL ${search} LIMIT ${(page-1)*10},10`);
                
                    //取题库中对应的用户名、课程名
                    let courses = await this.mydb.select('st_topic, st_users, st_course', 'tid, nickname, course_name',
                        `st_topic.uid=st_users.uid AND st_topic.course_id=st_course.course_id`);

                    let topicsObj = {}
                    for (let x = 0; x < topics.length; x++) {

                        let courseObj = {}
                        courses.forEach(val => {
                            if (topics[x]['tid'] == val['tid']) {
                                courseObj = Object.assign(val, topics[x]);
                            }
                        })
                        if (topicsObj[topics[x]['type_id']]) {
                            topicsObj[topics[x]['type_id']].push(courseObj)
                        } else {
                            topicsObj[topics[x]['type_id']] = [];
                            topicsObj[topics[x]['type_id']].push(courseObj)
                        }
                    }
                    let topicsArr = [];
                    topicsArr.push(topicsObj)

                    resolve({ code: 230,'item':item, topicsinfo: topicsArr })

                } else if (rid == 3) {
                    //取题库中数据

                    //取题库中数据
                    let item = 1;
                    let t_length = await this.mydb.select('st_topic', '*', `tid IS NOT NULL ${search}`); 
                    item = Math.ceil(Number(t_length.length)/10);
                    if (page >item) {
                        page = item;
                    }
                    if (page <= 0) {
                      page = 1;
                    }

                    let topics = await this.mydb.select('st_topic', '*', `uid=${uid} ${search} LIMIT ${(page-1)*10},10`);

                    //取题库中对应的用户名、课程名
                    let courses = await this.mydb.select('st_topic, st_users, st_course', 'tid, nickname, course_name',
                        `st_topic.uid=st_users.uid AND st_topic.course_id=st_course.course_id`);

                    let topicsObj = {}
                    for (let x = 0; x < topics.length; x++) {

                        let courseObj = {}
                        courses.forEach(val => {
                            if (topics[x]['tid'] == val['tid']) {
                                courseObj = Object.assign(val, topics[x]);
                            }
                        })
                        if (topicsObj[topics[x]['type_id']]) {
                            topicsObj[topics[x]['type_id']].push(courseObj)
                        } else {
                            topicsObj[topics[x]['type_id']] = [];
                            topicsObj[topics[x]['type_id']].push(courseObj)
                        }
                    }
                    let topicsArr = [];
                    topicsArr.push(topicsObj)
                    
                    resolve({ code: 230, "item":item,topicsinfo: topicsArr })
                }


            })
        } catch (err) {
            throw (err)
        }
    },

    // 题库删除 
    post_deletetopic: function ({ tid }) {
        try {
            return new Promise((resolve, reject) => {
                this.mydb.delete('st_topic', `tid=${tid}`)
                    .then(
                        result => {
                            resolve({ code: 231, msg: '题目删除成功' })
                        }
                    )
            })
        } catch (err) {
            throw (err)
        }
    },

    // 题库修改
    post_altertopic: function (data) {
        try {
            return new Promise((resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                this.mydb.alter('st_topic', { t_names: data.t_names, t_answer: data.t_answer, type_id: data.type_id, create_time: updatetimes },
                    `tid=${data.tid}`)
                    .then(
                        result => {
                            resolve({ code: 232, msg: '题目修改成功' })
                        }
                    )
            })
        } catch (err) {
            throw (err)
        }
    }
}

Object.setPrototypeOf(questionDB, require('./BaseModel'));
module.exports = questionDB;