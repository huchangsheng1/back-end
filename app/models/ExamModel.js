const decryptToken = require('../../libs/Token')
const sd = require('silly-datetime');
const { mydb } = require('./BaseModel');
const path = require('path');
const fs = require('fs');
const string_random = require('string-random');
const nodeXlsx = require('node-xlsx');
const { as } = require('tencentcloud-sdk-nodejs');

let ExamDB = {

    //创建考试  手动输入的题目
    post_index: function (data, uid) {
        try {
            return new Promise(async (resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                let topicObjs = {};
                for (let y = 0; y < data.questions.length; y++) {
                    let val = data.questions[y]


                    if (!topicObjs[val['examtype']]) topicObjs[val['examtype']] = [];


                    for (let x = 0; x < val['topics'].length; x++) {
                        if (val['examtype'] == '' || val['topics'][x]['stem'] == '' || val['topics'][x]['content'] == '' || val['topics'][x]['answer'] == '' || val['topics'][x]['score'] == '' || data.fullscore == '' || data.testname == '') {
                            resolve('411');
                        };
                        if (val['examtype'] != 1 || val['examtype'] != 2 || val['examtype'] != 3 || val['examtype'] != 4 || val['examtype'] != 5) {
                            resolve('411');
                        }

                        if (data.statime <= updatetimes) {
                            resolve('410')
                        }

                        //手动输入的题目存储题库表
                        let tnames = val['topics'][x]['stem'] + '|' + val['topics'][x]['content'];
                        //选择填空题  题目名+题目内容

                        if (val['examtype'] == 1 || val['examtype'] == 2) {
                            let sresult = await this.mydb.add('st_topic', { uid: uid, course_id: data.courseid, t_names: tnames, t_answer: val['topics'][x]['answer'], type_id: val['examtype'], create_time: updatetimes })

                            // topicId.push(sresult['insertId']);
                            topicObjs[val['examtype']].push({
                                tid: sresult['insertId'],
                                t_answer: val['topics'][x]['answer'],
                                t_score: val['topics'][x]['score']
                            })

                        } else {
                            let sresult = await this.mydb.add('st_topic', { uid: uid, course_id: data.courseid, t_names: val['topics'][x]['stem'], t_answer: val['topics'][x]['answer'], type_id: val['examtype'], create_time: updatetimes })

                            topicObjs[val['examtype']].push({
                                tid: sresult['insertId'],
                                t_answer: val['topics'][x]['answer'],
                                t_score: val['topics'][x]['score']
                            })

                        }
                    }

                };

                if (topicObjs['1'] != '' && topicObjs['2'] != '' && topicObjs['3'] != '' && topicObjs['4'] != '' && topicObjs['5'] != '') {
                    let topicArr = [];
                    topicArr.push(topicObjs);

                    // 创建的考试存入考试表中 
                    this.mydb.add('st_test', { test_json: JSON.stringify(topicArr), test_name: data.testname, gid: data.gid, course_id: data.courseid, uid: uid, stat_time: data.statime, end_time: data.endtime, full_score: data.fullscore, release_time: updatetimes, release_state: 0 })
                        .then(
                            result => {
                                resolve('201');
                            }
                        )
                } else {
                    resolve('411');
                }
                

            })
        } catch (err) {
            throw (err)
        }
    },


    // 创建考试  随机题库抽题
    post_questions: function (data, uid) {
        
        try {
            return new Promise(async (resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                //题库中各题数量
                let typeNumber = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }

                await this.mydb.select('st_topic',
                    [`COUNT(type_id=1 AND uid=${uid} AND course_id=${data.courseid} OR NULL) AS single`, `COUNT(type_id=2 AND uid=${uid} AND course_id=${data.courseid} OR NULL) AS multi`,
                    `COUNT(type_id=3 AND uid=${uid} AND course_id=${data.courseid} OR NULL) AS completion`, `COUNT(type_id=4 AND uid=${uid} AND course_id=${data.courseid} OR NULL) AS described`,
                    `COUNT(type_id=5 AND uid=${uid} AND course_id=${data.courseid} OR NULL) AS short`],
                    'tid IS NOT NULL')
                    .then(
                        result => {
                            typeNumber['1'] = result[0]['single'];
                            typeNumber['2'] = result[0]['multi'];
                            typeNumber['3'] = result[0]['completion'];
                            typeNumber['4'] = result[0]['described'];
                            typeNumber['5'] = result[0]['short'];
                        }
                    )

                let questions = [];

                await new Promise(async (reso, reje) => {

                    let singleObjs = {};

                    for (let x = 0; x < data['testnumber'].length; x++) {

                        let val = data['testnumber'][x];
                        let stopics = [];

                        //随机数
                        let singleNum = Math.floor(Math.random() * ((typeNumber[val['entype']] - val['tnumber']) + 1));

                        // 抽题数 <= 题库题目数量
                        if (val['tnumber'] <= singleNum) {
                            stopics = await this.mydb.select('st_topic', 'type_id, tid, t_answer, type_id', 'uid=? AND course_id=? AND type_id=?', [uid, data.courseid, val['entype']], `limit ${singleNum}, ${val['tnumber']}`)
                            

                        } else if (val['tnumber'] >= singleNum) {
                            stopics = await this.mydb.select('st_topic', 'type_id, tid, t_answer', 'uid=? AND course_id=? AND type_id=?', [uid, data.courseid, val['entype']], `limit 0, ${val['tnumber']}`)
                        }

                        if (stopics.length == 0) {
                            resolve({ code: 403, msg: '当前题库中无该课程试题' })
                        }

                        stopics.forEach(item => {
                            let singleObj = { tid: '', t_answer: '', t_score: '' };

                            singleObj['tid'] = item['tid'];
                            singleObj['t_answer'] = item['t_answer'];
                            singleObj['t_score'] = val['score'];

                            if (singleObjs[item['type_id']]) {
                                singleObjs[item['type_id']].push(singleObj)
                            } else {
                                singleObjs[item['type_id']] = [];
                                singleObjs[item['type_id']].push(singleObj)
                            }

                        })

                    }

                    reso(singleObjs);

                }).then(
                    rest => {
                        if (JSON.stringify({}) != '{}') {

                            if (rest['1'] != '' && rest['2'] != '' && rest['3'] != '' && rest['4'] != '' && rest['5'] != '') {
                                questions.push(rest)

                                // 考试信息存储
                                if (data.statime <= updatetimes) {
                                    resolve('410')
                                }
                                
                                this.mydb.add('st_test', { test_json: JSON.stringify(questions), test_name: data.testname, gid: data.gid, course_id: data.courseid, uid: uid, stat_time: data.statime, end_time: data.endtime, full_score: data.fullscore, release_time: updatetimes, release_state: 0 })
                                    .then(
                                        result => {
                                            resolve({ code: 201, msg: '创建考试成功' })
                                        }
                                    )
                            } else {
                                resolve({ code: 411, msg: '请填写相应考题' })
                            }
                      
                           
                        }


                    }
                )
            })
        } catch (err) {
            throw (err)
        }
    },


    //上传Excel题库文件
    post_upexcel: function (files, uid) {
        try {
            let suid = uid + ''
            if (files.extopic.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                return { code: 420, msg: '暂不支持上传此格式文件' }
            };

            // let topicName = string_random() + files.file.name
            let topicName = suid + files.extopic.name.substr(files.extopic.name.lastIndexOf('.'));

            fs.createReadStream(files.extopic.path).pipe(fs.createWriteStream(path.join(__dirname, '../../public/topic/', topicName)))
            return { code: 220, msg: '考题文件上传成功' }

        } catch (err) {
            throw (err)
        }
    },

    // 创建考试  Excel表导入
    post_pourinexcel: function (data, uid) {
        try {
            return new Promise(async (resolve, reject) => {
                const ex1 = nodeXlsx.parse(`./public/topic/${uid}.xlsx`);	//读取excel表格 
                let excel_content = ex1[0].data;	//取出excel文件中的第一个工作表中的全部数据
                excel_content.splice(0, 1);     	//一般来说表中的第一条数据可能是标题没有用，所以删掉
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                let topicObjs = {};
                for (let x = 0; x < excel_content.length; x++) {
                    let val = excel_content[x];
                    if (!topicObjs[val['4']]) topicObjs[val['4']] = [];
                    // 考试题目存储
                    // 选择填空题  题目名+题目内容
                    let tnames = val['1'] + '|' + val['2'];

                    if (val['4'] == 1 || val['4'] == 2){
                        let sresult = await this.mydb.add('st_topic', { uid: uid, course_id: data.courseid, t_names: tnames, t_answer: val['3'], type_id: val['4'], create_time: updatetimes })
                        topicObjs[val['4']].push({
                            tid: sresult['insertId'],
                            t_answer: val['3'],
                            t_score: val['5']
                        })
                    } else {
                        let sresult = await this.mydb.add('st_topic', { uid: uid, course_id: data.courseid, t_names: val['1'], t_answer: val['3'], type_id: val['4'], create_time: updatetimes })
                        topicObjs[val['4']].push({
                            tid: sresult['insertId'],
                            t_answer: val['3'],
                            t_score: val['5']
                        })
                    }

                }
                if (topicObjs['1'] != '' && topicObjs['2'] != '' && topicObjs['3'] != '' && topicObjs['4'] != '' && topicObjs['5'] != '') {
                    let topicArr = [];
                    topicArr.push(topicObjs)
                    
                    // 考试信息储存
                    if (topicArr.length != 0) {
                        this.mydb.add('st_test', { test_json: JSON.stringify(topicArr), test_name: data.testname, gid: data.gid, course_id: data.courseid, uid: uid, stat_time: data.statime, end_time: data.endtime, full_score: data.fullscore, release_time: updatetimes, release_state: 0 })
                            .then(
                                result => {
                                    resolve({ code: 201, msg: '创建考试成功' })
                                }
                            )
                    }
                } else {
                    resolve({ code: 411, msg: '试题缺少，请重新上传试题文件' })
                }
                


            })

        } catch (err) {
            throw (err)
        }
    },


    // 点击修改  回显考题内容
    get_revise: function (data) {
        try {
            return new Promise(async (resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                // 取出库中对应的考试信息
                let tpoicVal = {};
                await this.mydb.select('st_test', '*', `test_key=${data.test_key}`)
                    .then(
                        result => {
                            result.forEach(async val => {
                                tpoicVal = val;
                            })
                        }
                    )


                let test_jsonObj = {}
                JSON.parse(tpoicVal['test_json']).forEach(once => {
                    test_jsonObj = once;
                });

                let single = [];
                let singlePromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['1'].length; x++) {
                        let item = test_jsonObj['1'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            single.push(singleChoice)
                        })
                    }

                    reso(single)
                });

                let multi = [];
                let multiPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['2'].length; x++) {
                        let item = test_jsonObj['2'][x];
                        console.log(test_jsonObj['2']);
                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            multi.push(singleChoice)
                        })
                    }

                    reso(multi)
                });

                let completion = [];
                let completionPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['3'].length; x++) {
                        let item = test_jsonObj['3'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            completion.push(singleChoice)
                        })
                    }

                    reso(completion)
                })

                let described = [];
                let describedPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['4'].length; x++) {
                        let item = test_jsonObj['4'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            described.push(singleChoice)
                        })
                    }

                    reso(described)
                });

                let short = [];
                let shortPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['5'].length; x++) {
                        let item = test_jsonObj['5'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            short.push(singleChoice)
                        })
                    }

                    reso(short)
                });


                Promise.all([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise])
                    .then(
                        ([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise]) => {
                            let topicArr = [];
                            let topicObj = { '1': singlePromise, '2': multiPromise, '3': completionPromise, '4': describedPromise, '5': shortPromise }
                            // console.log(topicObj);
                            topicArr.push(topicObj);

                            let testinfo = {
                                test_key: tpoicVal['test_key'],
                                uid: tpoicVal['uid'],
                                course_id: tpoicVal['course_id'],
                                gid: tpoicVal['gid'],
                                test_name: tpoicVal['test_name'],
                                test_json: topicArr,
                                stat_time: tpoicVal['stat_time'],
                                end_time: tpoicVal['end_time'],
                                full_score: tpoicVal['full_score'],
                                release_state: tpoicVal['release_state']
                            };
                            
                            if (updatetimes >= datetime(tpoicVal['stat_time']) && updatetimes <= datetime(tpoicVal['end_time'])) {
                                resolve({ code: 412, msg: '当前正在考试中，不可修改' })
                            } else if (updatetimes > datetime(tpoicVal['end_time']) && tpoicVal['release_state'] != 0) {
                                resolve({ code: 413, msg: '本场考试已完成，不可修改' })
                            } else {
                                resolve({ code: 200, data: testinfo })
                            }
                        }
                    )

            })
        } catch (err) {
            throw (err)
        }
    },


    //确认修改考试相关信息
    post_revise: function (data, uid) {
        try {
            return new Promise((resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                let topicObjs = {}
                data.questions.forEach(val => {
                    val['topics'].forEach(item => {
                        
                        if (val['examtype'] == '' || item['stem'] == '' || item['content'] == '' || item['answer'] == '' || item['score'] == '') {
                            resolve('cannot be empty');
                        }

                        // 修改题库中题目
                        let tnames = item['stem'] + '|' + item['content'];
                        if (val['examtype'] == 1 || val['examtype'] == 2) {
                            this.mydb.alter('st_topic', { uid: uid, course_id: data.courseid, t_names: tnames, t_answer: item['answer'], type_id: val['examtype'], create_time: updatetimes }, `tid=${item['tid']}`)
                                .then(
                                    sresult => {
                                    }
                                )
                        } else {
                            this.mydb.alter('st_topic', { uid: uid, course_id: data.courseid, t_names: item['stem'], t_answer: item['answer'], type_id: val['examtype'], create_time: updatetimes }, `tid=${item['tid']}`)
                                .then(
                                    sresult => {
                                    }
                                )
                        }


                        let topicObj = { tid: '', t_answer: '', t_score: '' };

                        topicObj['tid'] = item['tid'];
                        topicObj['t_answer'] = item['answer'];
                        topicObj['t_score'] = item['score'];

                        if (topicObjs[val['examtype']]) {
                            topicObjs[val['examtype']].push(topicObj)
                        } else {
                            topicObjs[val['examtype']] = [];
                            topicObjs[val['examtype']].push(topicObj)
                        }

                    })
                });

                let topicArr = []
                topicArr.push(topicObjs)
            

                // 修改后的考试存入考试表中
                this.mydb.alter('st_test', { test_json: JSON.stringify(topicArr), test_name: data.testname, gid: data.gid, course_id: data.courseid, uid: uid, stat_time: data.statime, end_time: data.endtime, full_score: data.fullscore, release_time: updatetimes, release_state: 0 }, `test_key=${data.test_key}`)
                    .then(
                        result => {
                            resolve('alter success');
                        }
                    )
            })
        } catch (err) {
            throw (err)
        }
    },


    // 删除考试  
    get_delexam: function (data) {
        try {
            return new Promise((resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                this.mydb.select('st_test', 'test_key', 'test_key IS NOT NULL')
                    .then(
                        result => {
                            this.mydb.select('st_test', 'stat_time, end_time', `test_key=${data['test_key']}`)
                                .then(
                                    result => {
                                        if (updatetimes >= datetime(result[0]['stat_time']) && updatetimes <= datetime(result[0]['end_time'])) {
                                            resolve({ code: 413, msg: '当前正在考试中，不可删除' })
                                        } else {
                                            this.mydb.delete('st_test', `test_key=${data['test_key']}`)
                                                .then(
                                                    sresult => {
                                                        resolve({ code: 213, msg: '此场考试删除成功' })
                                                    }
                                                )
                                        }
                                    }
                                )
                        }
                    )

            })
        } catch (err) {
            throw (err)
        }
    },

    //发布考试
    get_relexam: function (data) {
        try {
            return new Promise((resolve, reject) => {
                let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                if (updatetimes > data['stat_time']) {
                    resolve({ code: 418, msg: '考试信息已过期,请修改' })
                } else {
                    this.mydb.alter('st_test', { release_state: 1 }, `test_key=${data['test_key']}`)
                        .then(
                            result => {
                                resolve({ code: 208, msg: '考试发布成功' })
                            }
                        )
                }

            })
        } catch (err) {
            throw (err)
        }
    },

    //考试场次信息渲染(管理员、教务、教师)
    get_exameach: function (page, req) {
        return new Promise(async (resolve, reject) => {
            try {

                //管理员、教务
                if (req.userdata['rid'] == 1 || req.userdata['rid'] == 2) {
                    let item = 1;
                    await this.mydb.select('st_test', ['count(test_key)'], 'test_key is not null').then(res => {
                        item = Math.ceil(Number(res[0]['count(test_key)']) / 10);
                    })
                    if (page > item) {
                        page = item;
                    }
                    if (page <= 0) {
                        page = 1;
                    }

                    await this.mydb.select('st_test, st_users, st_grades, st_course', 'test_key, test_name, gname, course_name, nickname, stat_time, st_test.end_time, release_time, release_state',
                        `st_test.gid=st_grades.gid AND st_test.course_id=st_course.course_id AND st_test.uid=st_users.uid ORDER BY release_time DESC LIMIT ${[(page - 1) * 10]},10`)
                        .then(
                            result => {
                                resolve({ code: 210, items: item, data: result })
                            }, err => {
                                throw err;
                            }
                        )
                };

                //教师
                if (req.userdata['rid'] == 3) {
                    let item = 1;
                    await this.mydb.select('st_test', ['count(test_key)'], 'uid=?', [req.userdata['uid']]).then(res => {
                        item = Math.ceil(Number(res[0]['count(test_key)']) / 10);
                    })
                    if (page > item) {
                        page = item;
                    }
                    if (page <= 0) {
                        page = 1;
                    }

                    await this.mydb.select('st_test, st_grades, st_course', 'test_key, test_name, gname, course_name, stat_time, st_test.end_time, release_time, release_state',
                        `st_test.gid=st_grades.gid AND st_test.course_id=st_course.course_id AND st_test.uid=${req.userdata['uid']} ORDER BY release_time DESC LIMIT ${[(page - 1) * 10]},10`)
                        .then(
                            result => {
                       
                                resolve({ code: 212, items: item, data: result })
                            }, err => {
                                throw err;
                            }
                        )
                }

            } catch (err) {
                reject(err);
            }
        })
    },


    //考试场次信息渲染(学生)
    get_stuexameach: function (data) {
        console.log(data)
        try {
            return new Promise((resolve, reject) => {
                this.mydb.select('st_test', 'test_key, test_name, stat_time, end_time', `course_id=${data['course_id']} AND release_state=1`)
                    .then(
                        result => {
                            console.log(result)
                            let testArr = []
                            let updatetimes = sd.format(new Date(Date.now() - 1000 * 60 * 5), 'YYYY-MM-DD HH:mm:ss');
                            let updatetimes2 = sd.format(new Date(Date.now()), 'YYYY-MM-DD HH:mm:ss');
                            let stuit = { code: 214, };
                            result.forEach((val, key) => {

                                if (updatetimes2 < datetime(val['stat_time'])) {
                                    //时间还没到,准备开始

                                    testArr.push({ 'state': 1, 'data': val });
                                }

                                if (updatetimes2 >= datetime(val['stat_time']) && updatetimes < datetime(val['stat_time'])) {
                                    //时间已经到了已经开始考试,在允许考试范围内

                                    testArr.push(testArr.push({ 'state': 2, 'data': val }));
                                }

                                if (updatetimes > datetime(val['stat_time'])) {
                                    //时间已经超出了允许迟到范围，考试不允许参与

                                    testArr.push({ 'state': 3, 'data': val });
                                }

                            })

                            testArr.forEach((item, key) => {
                                testArr[key].data.stat_time = this.datetime(item.data.stat_time);
                                testArr[key].data.end_time = this.datetime(item.data.end_time);

                            })
                            stuit['testinfo'] = testArr;
                            resolve(stuit);
                        }
                    )
            })
        } catch (err) {
            throw (err)
        }
    },


    // 查看历史成绩列表
    get_awaitexam: function (uid) {
        try {
            return new Promise((resolve, reject) => {
                this.mydb.select('st_test, st_deal, st_grades', 'st_test.test_key, st_test.test_name, st_test.stat_time, gname', `st_deal.uid=${uid} AND st_deal.state=1 AND st_deal.tid=st_test.test_key AND st_test.gid=st_grades.gid`)
                    .then(
                        result => {
                            if (result.length == 0) {
                                resolve({ code: 401, mes: '没有历史考试记录' })
                            } else {
                                resolve({ code: 215, testinfo: result })
                            }

                        }
                    )
            })
        } catch (err) {
            throw (err)
        }
    },


    // 点击开始考试



    //学生考试页面渲染
    get_startexam: function (data) {

        try {
            return new Promise(async (resolve, reject) => {

                let testinfo = {};
                await this.mydb.select('st_test', 'stat_time, end_time, full_score, test_json,stat_time', `test_key=${data.test_key} AND test_key IS NOT NULL`)
                    .then(
                        result => {
                            result.forEach(val => {
                                testinfo = val

                            })
                        }
                    )

                let test_jsonObj = {}
                JSON.parse(testinfo['test_json']).forEach(val => {
                    test_jsonObj = val;

                });

                let single = [];
                let singlePromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['1'].length; x++) {

                        let item = test_jsonObj['1'][x];
                        delete item['t_answer'];
                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            single.push(singleChoice)
                        })
                    }

                    reso(single)
                });

                let multi = [];
                let multiPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['2'].length; x++) {
                        let item = test_jsonObj['2'][x];
                        delete item['t_answer'];
                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            multi.push(singleChoice)
                        })
                    }

                    reso(multi)
                });

                let completion = [];
                let completionPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['3'].length; x++) {
                        let item = test_jsonObj['3'][x];
                        delete item['t_answer'];
                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            completion.push(singleChoice)
                        })
                    }

                    reso(completion)
                })

                let described = [];
                let describedPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['4'].length; x++) {
                        let item = test_jsonObj['4'][x];
                        delete item['t_answer'];
                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            described.push(singleChoice)
                        })
                    }

                    reso(described)
                });

                let short = [];
                let shortPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['5'].length; x++) {
                        let item = test_jsonObj['5'][x];
                        delete item['t_answer'];
                        let t_names = await this.mydb.select('st_topic', 't_names', `st_topic.tid=${item['tid']}`);
                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            short.push(singleChoice)
                        })
                    }
               
                    reso(short)

                });


                Promise.all([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise])
                    .then(
                        ([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise]) => {
                            
                            let topicArr = [];
                            let topicObj = { '1': singlePromise, '2': multiPromise, '3': completionPromise, '4': describedPromise, '5': shortPromise }
                            topicArr.push(topicObj);

                            let testObj = {
                                code: 211,
                                test_key: data.test_key,
                                end_time: testinfo['end_time'],
                                stat_time: testinfo['stat_time'],
                                full_score: testinfo['full_score'],
                                questions: topicArr
                            };

                            let updatetimes = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                           
                            if (new Date(updatetimes).getTime() > new Date(datetime(testinfo['end_time'])).getTime()) {
                                resolve({ code: 412, msg: '当前考试已结束' })
                            } else if (new Date(updatetimes).getTime() < new Date(datetime(testinfo['stat_time'])).getTime()) {
                                resolve({ code: 411, msg: '当前考试未开始' })
                            } else {
                                resolve(testObj)
                            }

                        }
                    )

            })
        } catch (err) {
            throw (err)
        }
    },


    //学生交卷 提交答题答案
    post_submitanswer: function (data, uid) {

        try {
            return new Promise((resolve, reject) => {
                this.mydb.add('st_deal', { tid: data.test_key, uid: uid, deal_nub: 0, deal_text: data.answer })
                    .then(
                        resu => {
                            this.mydb.alter('st_deal', { state: 0 }, `test_key=${data.test_key}`)
                                .then(
                                    result => {
                                        resolve({ code: 216, msg: '提交答卷成功' })
                                    }
                                )
                        }
                    )

            })
        } catch (err) {
            throw (err)
        }
    },


    //教师批阅答卷 学生答卷等待列表
    get_showtestpaper: function (page, rid, uid) {
        try {
            return new Promise(async (resolve, reject) => {
                if (rid == 1 || rid == 2) {
                    let item = 1;
                    await this.mydb.select('st_deal', ['count(deal_key)'], 'deal_nub=0').then(res => {
                        item = Math.ceil(Number(res[0]['count(deal_key)']) / 10);
                    })
                    if (page > item) {
                        page = item;
                    }
                    if (page <= 0) {
                        page = 1;
                    }
                    this.mydb.select('st_deal, st_test, st_users, st_course, st_grades',
                        'test_key, test_name, st_deal.uid, nickname, st_course.course_name, st_grades.gname',
                        `st_deal.tid=st_test.test_key AND st_deal.uid=st_users.uid AND st_test.course_id=st_course.course_id AND st_test.gid=st_grades.gid AND st_deal.state=0 LIMIT ${[(page - 1) * 10]},10`)
                        .then(
                            result => {
                                let testObj = { code: 217, items: item, examinee: result }
                                resolve(testObj)
                            }
                        )
                } else if (rid == 3) {
                    let item = 1;
                    await this.mydb.select('st_deal', ['count(deal_key)'], 'deal_nub=0').then(res => {
                        item = Math.ceil(Number(res[0]['count(deal_key)']) / 10);
                    })
                    if (page > item) {
                        page = item;
                    }
                    if (page <= 0) {
                        page = 1;
                    }

                    this.mydb.select('st_deal, st_test, st_users, st_course, st_grades',
                        'test_key, test_name, st_deal.uid, nickname, st_course.course_name, st_grades.gname',
                        `st_test.uid=${uid} AND st_deal.tid=st_test.test_key AND st_deal.uid=st_users.uid AND st_test.course_id=st_course.course_id AND st_test.gid=st_grades.gid AND st_deal.state=0 LIMIT ${[(page - 1) * 10]},10`)
                        .then(
                            result => {

                                let testObj = { code: 217, items: item, examinee: result }
                                resolve(testObj)
                            }
                        )
                }

            })

        } catch (err) {
            throw (err)
        }
    },

    //教师批阅答卷 回显学生答卷详情
    get_showdetails: function (data) {
        try {
            return new Promise(async (resolve, reject) => {
                //考试表中题目
                let testjson = []
                await this.mydb.select('st_test', 'test_json', `st_test.test_key=${data.test_key}`)
                    .then(
                        resu => {
                            resu.forEach(val => {
                                testjson = JSON.parse(val['test_json'])
                            })
                        }
                    )

                //学生提交的答案
                let dealtext = []
                await this.mydb.select('st_deal', 'deal_text', `tid=${data.test_key} AND uid=${data.uid}`)
                    .then(
                        result => {
                            result.forEach(val => {
                                dealtext = JSON.parse(val['deal_text']);
                            })
                        }
                    )


                let test_jsonObj = {}
                testjson.forEach(once => {
                    test_jsonObj = once;
                });

                let single = [];
                let singlePromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['1'].length; x++) {
                        let item = test_jsonObj['1'][x];
                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        let stuObj = {}
                        dealtext.forEach(once => {
                            if (once['tid'] == item['tid'] && once['tanswer'] == item['t_answer']) {
                                stuObj = { tid: once['tid'], t_answer: item['t_answer'], t_score: item['t_score'], tanswer: once['tanswer'], tscore: item['t_score'] }

                            } else if (once['tid'] == item['tid'] && once['tanswer'] != item['t_answer']) {
                                stuObj = { tid: once['tid'], t_answer: item['t_answer'], t_score: item['t_score'], tanswer: once['tanswer'], tscore: 0 }

                            }
                        });

                        let singleChoice = {}
                        t_names.forEach(val => {
                            singleChoice = Object.assign(item, val, stuObj);
                            single.push(singleChoice)
                        });
                    }

                    reso(single)
                });

                let multi = [];
                let multiPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['2'].length; x++) {
                        let item = test_jsonObj['2'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        let stuObj = {}
                        dealtext.forEach(once => {
                            if (once['tid'] == item['tid'] && once['tanswer'] == item['t_answer']) {
                                stuObj = { tid: once['tid'], t_answer: item['t_answer'], t_score: item['t_score'], tanswer: once['tanswer'], tscore: item['t_score'] }

                            } else if (once['tid'] == item['tid'] && once['tanswer'] != item['t_answer']) {
                                stuObj = { tid: once['tid'], t_answer: item['t_answer'], t_score: item['t_score'], tanswer: once['tanswer'], tscore: 0 }

                            }
                        });

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val, stuObj);
                            multi.push(singleChoice);
                        });
                    }

                    reso(multi)
                });

                let completion = [];
                let completionPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['3'].length; x++) {
                        let item = test_jsonObj['3'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        let stuObj = {}
                        dealtext.forEach(once => {
                            if (once['tid'] == item['tid']) {
                                stuObj = { tid: once['tid'], t_score: item['t_score'], t_answer: item['t_answer'], tanswer: once['tanswer'], tscore: 0 }
                            }
                        });

                        t_names.forEach(val => {
                            delete item['t_answer']

                            let singleChoice = Object.assign(item, val, stuObj);
                            completion.push(singleChoice)

                        })
                    }

                    reso(completion)
                });

                let described = [];
                let describedPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['4'].length; x++) {
                        let item = test_jsonObj['4'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        let stuObj = {}
                        dealtext.forEach(once => {
                            if (once['tid'] == item['tid']) {
                                stuObj = { tid: once['tid'], t_score: item['t_score'], t_answer: item['t_answer'], tanswer: once['tanswer'], tscore: 0 }
                            }
                        });

                        t_names.forEach(val => {
                            delete item['t_answer']
                            let singleChoice = Object.assign(item, val, stuObj);
                            described.push(singleChoice)
                        })
                    }

                    reso(described)
                });

                let short = [];
                let shortPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['5'].length; x++) {
                        let item = test_jsonObj['5'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        let stuObj = {}
                        dealtext.forEach(once => {
                            if (once['tid'] == item['tid']) {
                                stuObj = { tid: once['tid'], t_score: item['t_score'], t_answer: item['t_answer'], tanswer: once['tanswer'], tscore: 0 }
                            }
                        });

                        t_names.forEach(val => {
                            delete item['t_answer']
                            let singleChoice = Object.assign(item, val, stuObj);
                            short.push(singleChoice)
                        })
                    }

                    reso(short)
                });

                Promise.all([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise])
                    .then(
                        ([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise]) => {
                            let topicArr = [];
                            let topicObj = { '1': singlePromise, '2': multiPromise, '3': completionPromise, '4': describedPromise, '5': shortPromise }
                            topicArr.push(topicObj);

                            resolve({
                                code: 218,
                                test_key: data.test_key,
                                uid: data.uid,
                                answerdetails: topicArr
                            })
                        }
                    )

            })
        } catch (err) {
            throw (err)
        }
    },

    //教师批阅答卷
    post_correct: function (data) {
        try {
            
            return new Promise((resolve, reject) => {
                let totalScore = 0;
                for (let x = 0; x < data.fraction.length; x++) {
                    totalScore = totalScore + data.fraction[x]['mark']
                }

                data.fraction.push({ totalScore })
                
                this.mydb.alter('st_deal', { submit_score: JSON.stringify(data.fraction) }, `tid=${data.test_key} AND uid=${data.uid}`)
                    .then(
                        result => {
                            this.mydb.alter('st_deal', { state: 1 }, `tid=${data.test_key}`)
                                .then(
                                    resu => {
                                        resolve({ code: 219, msg: '试卷批阅完成' })
                                    }
                                )
                        }
                    )

            })

        } catch (err) {
            throw (err)
        }
    },

    //学生查看成绩
    get_viewscore: function (data, uid) {
        try {
            return new Promise(async (resolve, reject) => {
                let dealtext = [], fraction = [];

                // 查学生提交答案 题目得分
                await this.mydb.select('st_deal', 'deal_text, submit_score', `tid=${data.test_key} AND uid=${uid}`)
                    .then(
                        resu => {

                            dealtext = JSON.parse(resu[0]['deal_text']);
                            fraction = JSON.parse(resu[0]['submit_score']);

                        }
                    )


                let testjson = [];
                await this.mydb.select('st_test', 'test_json', `st_test.test_key=${data.test_key}`)
                    .then(
                        result => {
                            result.forEach(val => {
                                testjson = JSON.parse(val['test_json'])
                            })
                        }
                    )


                let testjsonObj = {};
                testjson.forEach(val => {

                    testjsonObj = val
                });

                testArr = [];
                testjsonObj['1'].forEach(item => {

                    testArr.push(item)
                });
                testjsonObj['2'].forEach(item => {

                    testArr.push(item)
                });
                testjsonObj['3'].forEach(item => {

                    testArr.push(item)
                });
                testjsonObj['4'].forEach(item => {

                    testArr.push(item)
                });
                testjsonObj['5'].forEach(item => {

                    testArr.push(item)
                })

                // 查找题目
                let questions = [];
                await new Promise(async (reso, rej) => {

                    let score = { totalScore: '' }
                    let singleObjs = { score };

                    for (let x = 0; x < dealtext.length; x++) {
                        let topicObj = {};
                        let topics = await this.mydb.select('st_topic', 'tid, type_id, t_names', `st_topic.tid=${dealtext[x]['tid']}`)

                        // 取出得分、提交的答案
                        let fractionObj = {};
                        fraction.forEach(once => {

                            score['totalScore'] = once['totalScore'];

                            if (once['tid'] == dealtext[x]['tid']) {
                                fractionObj = Object.assign(once, dealtext[x]);
                            }
                        });

                        // 取出正确答案、分数、得分、提交的答案
                        let testObj = {}
                        testArr.forEach(val => {

                            if (val['tid'] == fractionObj['tid']) {
                                testObj = Object.assign(val, fractionObj);
                            }
                        })

                        topics.forEach(item => {
                            let tnamesObj = { tid: '', t_names: '', t_answer: '', t_score: '', tanswer: '', mark: '' };
                            tnamesObj['tid'] = item['tid'];
                            tnamesObj['t_names'] = item['t_names'];
                            tnamesObj['t_answer'] = testObj['t_answer'];
                            tnamesObj['t_score'] = testObj['t_score'];
                            tnamesObj['tanswer'] = testObj['tanswer'];
                            tnamesObj['mark'] = testObj['mark'];

                            if (singleObjs[item['type_id']]) {
                                singleObjs[item['type_id']].push(tnamesObj)
                            } else {
                                singleObjs[item['type_id']] = [];
                                singleObjs[item['type_id']].push(tnamesObj)
                            }
                        })

                    };

                    reso(singleObjs);

                }).then(
                    resu => {
                        questions.push(resu);

                        resolve({ code: 221, testinfo: questions })
                    }
                )
            })
        } catch (err) {
            throw (err)
        }
    },

    //回显考题答题情况
    get_showsituation: function (data) {
        try {
            return new Promise(async (resolve, reject) => {
                // 取出库中对应的考试信息
                let tpoicVal = {};
                await this.mydb.select('st_test', '*', `test_key=${data.test_key}`)
                    .then(
                        result => {
                            result.forEach(async val => {
                                tpoicVal = val;
                            })
                        }
                    )

                let test_jsonObj = {}
                JSON.parse(tpoicVal['test_json']).forEach(once => {
                    test_jsonObj = once;
                });

                let single = [];
                let singlePromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['1'].length; x++) {
                        let item = test_jsonObj['1'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            single.push(singleChoice)
                        })
                    }

                    reso(single)
                });

                let multi = [];
                let multiPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['2'].length; x++) {
                        let item = test_jsonObj['2'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            multi.push(singleChoice)
                        })
                    }

                    reso(multi)
                });

                let completion = [];
                let completionPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['3'].length; x++) {
                        let item = test_jsonObj['3'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            completion.push(singleChoice)
                        })
                    }

                    reso(completion)
                })

                let described = [];
                let describedPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['4'].length; x++) {
                        let item = test_jsonObj['4'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            described.push(singleChoice)
                        })
                    }

                    reso(described)
                });

                let short = [];
                let shortPromise = await new Promise(async (reso, rej) => {
                    for (let x = 0; x < test_jsonObj['5'].length; x++) {
                        let item = test_jsonObj['5'][x];

                        let t_names = await this.mydb.select('st_topic', 't_names', `tid=${item['tid']}`);

                        t_names.forEach(val => {
                            let singleChoice = Object.assign(item, val);
                            short.push(singleChoice)
                        })
                    }

                    reso(short)
                });


                Promise.all([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise])
                    .then(
                        ([singlePromise, multiPromise, completionPromise, describedPromise, shortPromise]) => {
                            let topicArr = [];
                            let topicObj = { '1': singlePromise, '2': multiPromise, '3': completionPromise, '4': describedPromise, '5': shortPromise }
                            topicArr.push(topicObj);

                        }
                    )

            })

        } catch (err) {
            throw (err)
        }
    },
    //根据身份查班级
    findgradeModel(uid, rid) {
        return new Promise((resolve, reject) => {
            try {
                if (rid == 1 || rid == 2) {
                    this.mydb.select('st_grades', 'st_grades.gid, st_grades.gname', 'gid IS NOT NULL').then(res => {
                        resolve({
                            code: 200,
                            mes: 'grades is find data',
                            data: res
                        })
                    }, err => {
                        reject(err);
                    })
                } else if (rid == 3) {
                    this.mydb.select('st_grades, st_course', 'st_grades.gid, st_grades.gname', 'st_course.uid=48 AND st_course.gid=st_grades.gid').then(res => {
                        resolve({
                            code: 200,
                            mes: 'grades is find data',
                            data: res
                        })
                    }, err => {
                        reject(err);
                    })
                }

            } catch (err) {
                reject(err);
            }
        })
    },

    // 根据班级查课程
    findclassModel(gid) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.select('st_course', 'course_id, course_name', `gid=${gid}`).then(
                    resu => {
                        resolve({
                            code: 200,
                            mes: 'grades is find data',
                            data: resu
                        })
                    }, err => {
                        reject(err)
                    }
                )
            } catch (err) {
                throw (err)
            }
        })
    }

}

Object.setPrototypeOf(ExamDB, require('./BaseModel'));
module.exports = ExamDB;



function datetime(stime) {
    let strtime = new Date(stime);
    strtime = strtime.getFullYear() + '-' + (strtime.getMonth() + 1) + '-' + strtime.getDate() + ' ' +
        strtime.getHours() + ':' + strtime.getMinutes() + ':' + strtime.getSeconds();
    return strtime;
}