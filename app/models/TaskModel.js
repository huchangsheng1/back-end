
const nodeXlsx = require('node-xlsx')
const MyDbs = require('../../libs/MyDB')
let mydb = new MyDbs();
const fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');
const { forEach } = require('async');
const e = require('express');
const { es } = require('tencentcloud-sdk-nodejs');
module.exports={
    
    
    /**
     * 发布作业
     * @param {Array} tid_json 作业题目内容答案
     * @param {string} course  作业名称
     * @param {number} courseID 作业id
     * @param {datetime} end_time 截止时间
     * @param {number} full 满分
     * @param {datetime} release_time 发布时间
     * @param {number} codes 修改/或发布参数
     * @returns 
     */
    read_task: async function(tid_json,course, courseID,end_time,full,codes){
        
        if (tid_json == '' ||  course == '' || courseID == '' || end_time == '' || full == '') {
            return {
                code: 400,
                mes:'have a condition is null'
            }
        }
  
      
   
        let data = new Date()
        let nowDate = data.getFullYear() + '-' + Number(data.getMonth() + 1) + '-' + data.getDate() + ' ' +
                data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds();
        let a = 1
        //判断是否有发布过
        await mydb.select('st_work', ['work_nub','work_name'], `course_id=?`, [courseID])
            .then(
                function (reslut) {
               
               
                            
                    //之前没有length(如果有问题改length)
                    if (reslut.length != 0) {
                            // a = -1;
                            if (codes == 202) {
                                a = 2
                                mydb.alter('st_work',{//请求为修改
                                    tid_json:tid_json,
                                    end_time:  String(end_time).substr(0,10).trim(),
                                    full: full,
                                    release_time:nowDate
                                },'course_id =? AND work_name =?',[courseID,course])
                            }else {
                                let b = 1
                                reslut.forEach(item => {
                                    if(item.work_name == course){//判断发布的作业是否有存在 存在修改，不存在添加(无法修改作业名称)
                                        b = -1
                                        mydb.alter('st_work',{
                                            tid_json:tid_json,
                                            end_time: String(end_time).substr(0,10).trim(),
                                            full: full,
                                            release_time:nowDate
                                        },'course_id =? AND work_name =?',[courseID,course])
                                    }
                                })
                                if(b == 1){
                                    mydb.add('st_work', {
                                        work_name: course,
                                        course_id: courseID,
                                        tid_json:tid_json,
                                        create_time:nowDate,
                                        end_time: String(end_time).substr(0,10).trim(),
                                        full: full,
                                        release_time:nowDate
                                       })
                                }
                            }
                    }else {
                        if(codes == 201){
                            mydb.add('st_work', {
                                work_name: course,
                                course_id: courseID,
                                tid_json:tid_json,
                                create_time:nowDate,
                                end_time: String(end_time).substr(0,10).trim(),
                                full: full,
                                release_time:nowDate
                               })
                        }  
                    }
                }
            )         
        if( a == -1){
            return {
                code:411,
                mes:'write work is excits'
            }
        }else if (a == 2) {
            return {
                code:200,
                mes:'xiu work is excits'
            }
        }
        return {
            code:200,
            mes:'write work is ok'
        }
      },
    //删除作业
    /**
     * 
     * @param {number} work_nub 作业编号
     * @param {number} course_id 课程id
     * @returns 
     */
    del_work : async function(work_nub) {
        let a = 1
        await mydb.delete('st_work', 'work_nub =? ', [work_nub])
            .then(
                reslut => {
                    if(reslut.affectedRows > 0){
                        a = -1
                    }
                }
            )

        if(a == -1) {
            return {
                code:200,
                mse: 'delete is ok',
            }
        }else if (a == 1){
            return {
                code:400,
                mse: 'delete is not'
            }
        }
    },
    //EXcel
        /**
     *  表格上传题目到题库
     * @param {Array} req_task  提交的excil表格
     * @param {number} teacherID  教师ID
     * @param {number} courseID 课程ID
     * @param {string/array} excel_content excil表格内
     * @param {} req.files.aid.path Excel
     * 
     */
    read_xlse:async function(req_task){
        // if(teacherID =='' || courseID == ''){
            // return {
                // code: 400,
                // mes:'teacherID or courseID is null'
            // }
        // }
        //判断格式Excel
        const firts = nodeXlsx.parse(req_task.files.aid.path)
        let firts_content = (firts[0].data)[0];
        let nowwork2 = firts[0].data
        let nowwork = nowwork2.splice(1)
        let firtsarr = [ '考题id', '考试题目', '选项', '答案', '类型', '分数' ]
        let firts_num = 1;
        firts_content.forEach((item, key) => {
            if(item !== firtsarr[key]){
                firts_num = -1
            }
        })
        if ( firts_num == -1){
            return {
                code:400,
                mes:'格式错误'
            }
        } 
        //上传
        // fs.createReadStream().pipe(fs.createWriteStream())
        let wrtiefun = fs.createReadStream(req_task.files.aid.path).pipe(fs.createWriteStream('./public/task/'+req_task.files.aid.name))
        //存入题库
        wrtiefun.on('finish', async function() {
            const ex1 = nodeXlsx.parse('./public/task/'+ req_task.files.aid.name)
            let excel_content = ex1[0].data
            excel_content.splice(0, 1)
            let nowt_names = ''
         
            let data = new Date()
            let nowDate = data.getFullYear() + '-' + Number(data.getMonth() + 1) + '-' + data.getDate() + ' ' +
                data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds();
            let our = {}
         //let taskName = []
            let k = 0;
            for (let x = 0; x < excel_content.length; x++) {

                if (excel_content[x][2]) {
                    nowt_names = excel_content[x][1] + '|' + excel_content[x][2]
                } else {
                    nowt_names = excel_content[x][1]
                }
                // 去重复存入题库
                await mydb.find('st_topic', 'tid', `t_names=? `, [nowt_names])
                    .then(
                        async function (reslut) {
                            if (reslut.length == 0) {
                                await mydb.add('st_topic', {
                                    uid: teacherID,
                                    course_id: courseID,
                                    t_names: nowt_names,
                                    t_answer: excel_content[x][3],
                                    type_id: excel_content[x][4],
                                    create_time: nowDate
                                })
                            }
                        }
                    )
                // await mydb.find('st_topic', ['t_names', 't_answer'], `t_names=? AND course_id=? AND uid=?`, [nowt_names, courseID, teacherID])
                //     .then(
                //         reslut => {
                //             if (!reslut.t_answer) {
                //                 reslut.t_answer = ''
                //             }
                //             let rut = reslut.t_names
                //             our = {
                //                  [ rut.substr(0, reslut.t_names.indexOf('|'))]: reslut.t_answer
                //             }
                //             taskName.push(our)
                //         }
                //     )
            }
        })     
        let taskName = []       
        nowwork.forEach(item => {
            if(item[2] == '' || item[2] == undefined){
                item[2] = ''
            }
            taskName.push({
                [item[1]]:item[2]
            })
        })
        return {
            code:200,
            mes:'upload is ok',
            data:taskName
        }
    },

    //遍历该教师的题目发布的作业

    /**
     * 查看教师对应课程发布的作业  也就是显示作业内容
     * @param {number} teacherID  教师id
     * @param {number} courseID  课程id
     * @returns 
     */
    view_homework :async function (work_nub,course_id){
        // return readtask.ViewHomework(work_name,courseID)
        let v_work =''
        let a = 1;
        let w = []
        let n = []
        await mydb.select('st_work', ['work_nub','tid_json'], `work_nub =?  AND course_id =? `,[work_nub,course_id])
            .then(
                reslut => {
                    if(reslut.length == 0){
                        a = -1
                    }else {
                        v_work = reslut[0].tid_json.split('&')
                        v_work.forEach(item => {
                            let now= item.lastIndexOf(')')
                            n.push(item.substring(item.indexOf('(')+1,now));
                            w.push(item.substr(0,item.lastIndexOf('|')))
                        })             
                    }                                           
                }
            ) 
            //判断是否存在作业
        if(a == -1){
            return {
                code:402,
                mse: 'the work is not form teacher'
            }
        }       
        let work = {}
        let workup = []
        //遍历作业内容
        w.forEach((item,key) => {
            work = {
                type:n[key],
                content:item.split('|')[0]+'|'+item.split('|')[1]
            }
            workup.push(work)
        })
        return {
            code:200,
            mse:'viewWork is ok',
            data:workup
        }
    },
    
    
    /**
     * //修改作业显示
     * /判断直接返回提交的内容
     * @param {number} uid 作业编号 
     * @param {number} tid  学生id
     * @returns 
     */
    modify_work: async function(uid,tid,course_id){
        let work = ''
        await mydb.select('st_deal','deal_text','uid =? AND tid =?',[uid, tid])
            .then (
                reslut => {
                    work = reslut
                }
            )
            
        let head = [];
        let tail = []
        work.forEach(item => {
            if(item.deal_text != null || item.deal_text != undefined){
                head.push(item.deal_text.substr(0, item.deal_text.indexOf('|')))
                tail.push(item.deal_text.substr(item.deal_text.indexOf('|')+1 ))
            }  
        })
        let r_obj = []
        for(let x =0 ; x < head.length; x++){
            r_obj.push(head[x]+'|'+tail[x]) 
        }
        let work_json = ''
        await mydb.find('st_work','tid_json','course_id = ? AND work_nub = ?',[course_id,tid])
            .then(
                reslut => {
                    work_json = (reslut.tid_json.split('&'))
                }
            )
        
        let nowwork = []
        for(let x =0; x <work_json.length;x++){
            
            for(let y=0; y <r_obj.length; y++){
               
                if(work_json[x].substr(0,work_json[x].indexOf('|')) == r_obj[y].substr(0,r_obj[y].indexOf('|'))){
                    nowwork.push( work_json[x].substr(0,work_json[x].lastIndexOf('|'))+'|'+
                                r_obj[y].substr(r_obj[y].indexOf('|')+1) +'['+
                                    work_json[x].substring(work_json[x].lastIndexOf('|')+1,work_json[x].indexOf('(')) +']')
                                   
                }
            }
        }
        
        return {
            code:200,
            mes:'see work ok',
            data:nowwork
        }       
    },


    /**
     * 提交作业
     * @param {number} courseID 课程ID
     * @param {String} deal_text 学生提交的答案 '题目1|答案1&题目2|答案2'
     * @param {number} uid 提交入id学生uid
     * @param {number} tid 作业编号
     * @param {number} deal_nub 表示作业 1
     * @returns 
     */
    HeadOverWork :async function (req){
       
        let courseID = req.body.courseID;
        let deal_text = req.body.deal_text;
        let uid = req.body.uid;
        let tid = req.body.tid;
        let deal_nub = req.body.deal_nub;
        let newdeal_text = ''
        JSON.parse(deal_text).forEach(item => {
            item.deal_text = item.deal_text.replace(" ",'+')
            newdeal_text += (newdeal_text == '')?  item.deal_text: '&'+(item.deal_text) 
        })
      
        let dealWork = newdeal_text.split('&')
    
        let data = new Date()
        let nowDate = data.getFullYear() + '-' + Number(data.getMonth() + 1) + '-' + data.getDate() + ' ' +
            data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds(); 
        let a = 1
        //查看是否超时提交
        await mydb.find('st_work','end_time','course_id = ?',[courseID])
            .then(
                reslut => {
                    let date = new Date(reslut.end_time).getTime()
                    let date2 = new Date(nowDate).getTime()                 
                    if(date < date2){
                       a = -1
                    }
                }
            )      
        if(a == -1){
            return {
                code:400,
                mes:'超时提交'
            }
        }  
        //查看是否提交过
        let b = 1
        let st_deal_id = ''
        await mydb.select('st_deal','deal_key,deal_text','tid = ? AND uid = ?',[tid, uid])
            .then(
                reslut => {
                   
                    if(reslut.length == 0){
                        b = -1
                    } else {
                        st_deal_id = reslut
                        
                    }
                }
            )
        
        if(b == -1){
            return await newchar(courseID,dealWork,uid,tid,deal_nub)
        }else {
            
            let deal_id = []
            let subject = []
            st_deal_id.forEach(item => {
                deal_id.push(item.deal_key);
                subject.push(item.deal_text)
            })
          
            deal_id.forEach((item, key) => {
              
                dealWork.forEach(once => {
                    if(subject[key].substr(0,subject[key].indexOf('|')) == once.substr(0,once.indexOf('|'))){
                        
                        mydb.alter('st_deal',{deal_text : once},'tid =? AND uid =? AND deal_key = ?',[tid, uid, item])
                    }
                })
                
                
                
                
            })
        }
        return {
            code:200,
            mse :'修改成功'
        }   
    },


    //点击科目时候遍历科目内容
    /**
     * 
     * @param {number} work_nub  作业编号
     * @param {number} course_id 课程id
     * @param {string} work_name 作业名称
     * @returns 
     */
    TeacherLook : async function (work_nub,course_id,work_name){
        try {
            let Look = ''
            await mydb.find('st_work','tid_json','work_nub = ? AND course_id = ? AND ',[work_nub,course_id,work_name])
                .then(
                    reslut => {
                        Look=reslut.tid_json
                    }
                )
            let teacherwork = ''
            teacherwork =Look.split('&')
            return {
                code:200,
                mes: 'see  TeacherLook is ok',
                data:teacherwork
            }
        } catch {
            throw err
        }      
    },
    
    //点击课程时候遍历所有作业
    TeacherWorkLook: async function (course_id,nowtime,uid) {
       
        try {
            let workname = ''
            let thenow = 1
            let nowclass = [];
            let nowwork_nub = []
            let q = 1
            
            await mydb.select('st_work', 'work_nub, work_name,course_id,create_time,end_time', 'course_id = ?', [course_id])
                    .then(
                        reslut => {

                            workname = reslut;

                        }
                    )
              
            if (workname.length == 0) {
                return {
                    code: 400,
                    mes: 'is not one work'
                }
            }else {
                let workArr = [];
                let worktime = [];
                let worknewtime =[];
               
               
                for(let i=0 ;i<workname.length ; i++) {
                    workArr.push(workname[i].work_nub +'|'+ workname[i].work_name +'|'+  workname[i].course_id);
                    worktime.push(workname[i].create_time)
                    worknewtime.push(workname[i].end_time)
                    nowwork_nub.push(workname[i].work_nub)
                }
                let k = [];
                
                for(let i =0 ; i< nowwork_nub.length ; i++ ) {
                    
                   await mydb.find('st_deal', 'tid', 'uid = ? AND tid =?', [uid, nowwork_nub[i]])
                    .then(
                        res => {
                            if(res.tid){
                                q = 2
                            }else {
                                q = 1
                            }     
                            nowclass.push(q)
                        }
                    )
                }
                
                // let date = new Date(reslut.end_time).getTime()
                let newworktime = []
                let endtime = []
                worktime.forEach(item => {
                    newworktime.push(datetime(item))
                })
                let thistime = []
                let timeclass = 1
                
                worknewtime.forEach((item, key) => {
                    
                    
                    if(nowclass[key] == 2){
                            thenow = 2;
                        if(datetime(item) < datetime(nowtime)){
                            thenow = -1 ;//可查看
                        }
                    }else if(datetime(item) < datetime(nowtime)){
                        thenow = -1 ;//可查看
                    }
                    endtime.push(datetime(item))
                })
                return {
                    code:200,
                    mes: 'All courses is ok',
                    data: workArr,
                    oldtime: newworktime,
                    endtime:endtime,
                    now:thenow
                }
            }
        }catch {
            throw new err
        }

    },      

    //学生查询写完作业
    Lookwork: async function (req){
      
        let tid = req.query.test_key;
        let uid = req.query.uid;
        let course_id = req.query.course_id;
       
        let work_status = 1;
        let query_content = []
        await mydb.select('st_deal','deal_text','tid = ? AND uid =?',[tid, uid])
            .then(
                reslut => {
                    if(reslut.length == 0){
                        work_status = -1
                    }else {
                        reslut.forEach(item => {
                            query_content.push(item.deal_text)
                        })
                    }
                }
            )
        if(work_status == -1){
            return {
                code:400,
                mes:'未提交作业'
            }
        }
      
        let work_json = ''
        await mydb.find('st_work','tid_json','course_id = ? AND work_nub = ?',[course_id,tid])
            .then(
                reslut => {
                    work_json = (reslut.tid_json.split('&'))
                }
            )
        let nowwork = []
        for(let x =0; x <work_json.length;x++){
         
         
            for(let y=0; y <query_content.length; y++){
                if(work_json[x].substr(0,work_json[x].indexOf('|')) == query_content[y].substr(0,query_content[y].indexOf('|'))){
                    nowwork.push( work_json[x].substr(0,work_json[x].lastIndexOf('|'))+'|'+
                                    query_content[y].substr(work_json[x].indexOf('|')+1) +'['+
                                    work_json[x].substring(work_json[x].lastIndexOf('|')+1,work_json[x].indexOf('(')) +']')
                }
            }
        }
    
        return {
            code:200,
            mes:'查看成功',
            data:nowwork
        }
    },

    //教师查他名下的发布的作业
    TeacherWork:async function(req){
    

        //查询教师有啥课程的id
        let teachr_work = ''
        await mydb.select('st_course','course_id,course_name','uid = ?',[req.userdata.uid])
            .then(
                res =>{
                    teachr_work = res
                }  
            )
            let workArr = []
            let a =1
            
            for(let x =0; x <teachr_work.length; x++){
                await mydb.select('st_work','work_nub,work_name,course_id,create_time,end_time','course_id =?',[teachr_work[x].course_id])
                    .then(
                        res => {
                            if(res.length == 0) {
                                a = -1
                            }
                            res.forEach((once,key) => {
                                workArr.push({
                                    work_nub:once.work_nub,
                                    work_name: once.work_name,
                                    course_id: teachr_work[x].course_name+'('+once.course_id+')',
                                    create_time:datetime(once.create_time),
                                    end_time:datetime(once. end_time),
                                })
                            })
                        }
                    )
            }
            if(workArr.length > 0){
                return {
                    code:200,
                    mes:'查看成功',
                    workArr:workArr
                }
            }else if(a == -1) {
                return {
                    code:400,
                    mes:'查失败，改教师未发布作业',
                }
            }
    },

    //教师获得班级学生的信息(为了批改)
    CorrectingWork:async function(req){
        let workNub = JSON.parse(req.query.params).workNub;//作业id
        let course_id = JSON.parse(req.query.params).course_id;//课程id
        let teacherID = req.userdata.uid;
        let nowgid = ''
        await mydb.find('st_course','gid','course_id =? AND uid =?',[course_id,teacherID])
            .then(
                res => {
                    nowgid = res.gid;//拿到班级
                }
            )
 
        let nowstudent = ''
        await mydb.select('st_users','nickname,uid','gid =? AND rid = 4',[nowgid])
                .then(
                    res =>{
                        //nickname: '小翔', uid: 28 
                        nowstudent =res;//拿到学生id和学生姓名
                    }
                )
        let nowstudentArr = [];
        for(let x =0 ;x <nowstudent.length;x++){
            nowstudentArr.push(
                {
                    uid:nowstudent[x].uid,
                    student:nowstudent[x].nickname,
                }
            )
        }
        if(nowstudentArr.length > 0){
            return {
                code:200,
                mes:'有学生作业',
                date:nowstudentArr
            }
        }else {
            return {
                code:400,
                mes:'没有学生提交作业',
            }
        }
    },

        //教师检查作业内容
    TeacherLookWork:async function(req) {
        let tid = JSON.parse(req.query.params).test_key;
        let uid = JSON.parse(req.query.params).uid;
        let course_id = JSON.parse(req.query.params).course_id;
        
        let work_status = 1;
        let query_content = []
        await mydb.select('st_deal','deal_text','tid = ? AND uid =?',[tid, uid])
            .then(
                reslut => {
                   
                    if(reslut.length == 0){
                        work_status = -1
                    }else {
                        reslut.forEach(item => {
                            query_content.push(item.deal_text)
                        })
                    }
                }
            )
        if(work_status == -1){
            return {
                code:400,
                mes:'未提交作业'
            }
        }
      
        let work_json = ''
        await mydb.find('st_work','tid_json','course_id = ? AND work_nub = ?',[course_id,tid])
            .then(
                reslut => {
                    work_json = (reslut.tid_json.split('&'))
                }
            )
     
        let nowwork = []
        for(let x =0; x <work_json.length;x++){
            for(let y=0; y <query_content.length; y++){
                if(work_json[x].substr(0,work_json[x].indexOf('|')) == query_content[y].substr(0,query_content[y].indexOf('|'))){
                    nowwork.push( work_json[x].substr(0,work_json[x].lastIndexOf('|'))+'|'+
                                    query_content[y].substr(work_json[x].indexOf('|')+1) +'['+
                                    work_json[x].substring(work_json[x].lastIndexOf('|')+1,work_json[x].indexOf('(')) +']')
                }
            }
        }
     
        return {
            code:200,
            mes:'查看成功',
            data:nowwork
        }
    },
    TeacherCorrect:async function(req){
    
        let uid = JSON.parse(req.query.params).uid;
        let tid = JSON.parse(req.query.params).tid;
        let work_json = JSON.parse(req.query.params).work_json;
        let nowdeal = '';
        if(uid == '' || tid =='' || work_json.length == 0){
            return {
                code:400,
                mes:'没有选择学生或没有批改'
            }
        }
        await mydb.select('st_deal','deal_key,deal_text','uid =? AND tid =?',[uid,tid])
            .then(
                res => {
                    nowdeal = res
                }
            )
            let nowobject = []
            await nowdeal.forEach(item=> {
                work_json.forEach((once,key) => {
                 
                    if(item.deal_text.substr(0,item.deal_text.indexOf('|')) == once.workname) {
                        nowobject.push({
                            deal_key: item.deal_key,
                            submit_score: once.full
                        })
                    }
                })
                
            })
          //批改
        for(let x =0; x < nowobject.length; x++){
             mydb.alter('st_deal',{submit_score: nowobject[x].submit_score},'deal_key =?',[nowobject[x].deal_key])
        } 
        return {
            code:200,
            mes:'批改ok'
        }
    },
    //获得老师名下的课程
    WriteClassname:async function (req){
        let teacherid = req.userdata.uid;
        let a = 1;
        let className = ''
        await mydb.select('st_course','course_id,course_name,gid','uid =?',[teacherid])
            .then(
                res => {
                    if(res.length == 0){
                        a = -1
                    }else {
                        className = res
                    }
                    
                }
            )
            if(a == -1) {
                return {
                    code:400,
                    mes:'老师没有开可课程'
                }
            }
            
            let retunrArr = []
            className.forEach(item => {
                retunrArr.push({
                    course_id: item.course_id,
                    course_name: item.course_name,
                    gid: item.gid,
                })
            })
       
            return {
                code:200,
                mes:'查看课程成功',
                date:className
            }
    }
}


//提交作业方法
async function newchar(courseID,deal_text,uid,tid,deal_nub) {
   
    let answer = [];
    let fen = []
    
    deal_text.forEach(function (item) {

            answer.push(item)
        })
    let asFen = 0
   
    let mo = []
    await mydb.find('st_work', 'tid_json', 'work_nub = ?', [tid])
            .then(
                reslut => {
                    reslut.tid_json.split('&').forEach(item => {
                        mo.push(item.split('|'))
                    })
                   
                }
        )
    let k = 0
    
        //没有提交过执行
        answer.forEach((once,key)=> {
            mo.forEach(item => {
              
                if(once.substr(0,once.indexOf('|')) == item[0]){
                  
                    if (item[2] == answer[k]) {
                        let fraction = 0
                        if (item[2] == '' || item[2] == undefined) {
                            fraction = 0
                        } else {
                            fraction = item[3]
                        }
                        mydb.add('st_deal', {
                            tid: tid,
                            uid: uid,
                            deal_nub: deal_nub,
                            deal_text: once,
                            submit_score: fraction
                        })
                        k++
                    }else {
                        if(item[2] != ''){
                            mydb.add('st_deal', {
                                tid: tid,
                                uid: uid,
                                deal_nub: deal_nub,
                                deal_text: deal_text[k],
                                submit_score: 0
                            })
                            k++
                        }
                    }
                }

            })
        })
        return {
            code:200,
            mes:'提交成功'
        }
}
function datetime(stime) {
        let strtime = new Date(stime);
        strtime = strtime.getFullYear() + '-' + (strtime.getMonth() + 1) + '-' + strtime.getDate() + ' ' +
            strtime.getHours() + ':' + strtime.getMinutes() + ':' + strtime.getSeconds();
        return strtime;
}





