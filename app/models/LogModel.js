let LogModel = {

    //添加日志信息
    /**
     * 
     * @param {object} data 
     *      data 的参数以键值对的形式就行
     *      uid	int(10)		操作的用户id
     *      content	varchar(60)		操作日志内容
     *      log_time	datetime		操作时间        //时间搓
     *      log_ip	varchar(20)		操作的人的IP
     *      log_type	tinyint(1)		操作的类型,0为用户类,1为考试作业类,2为课程类
     * 
     */
    addlog : function(data){
        
        try {
            this.mydb.add('st_log',data).then(res => {
                resolve({
                    code : 200,
                    mes : 'log is add yes'
                });
            },err => {reject(err)})
        }catch(err) {
            reject(err);
        }     
  
    },

    //查看日志表所有信息
    selectlog : function(page,keyword,category,start_time,end_time) {

        return new Promise(async (resolve,reject) => {
            let sql = 'st_log.uid = st_users.uid';
            if (keyword) {
                sql = sql +' and ' + `content LIKE '%${keyword}%'`;
            }
            if (category) {
                sql = sql + ' and ' + `log_type=${category}`;
            }
            if (start_time) {
                sql = sql + ' and ' + `log_time >= '${start_time}'`;
            }
            if (end_time) {
                sql = sql + ' and ' + `log_time <='${end_time}'`;
            }
            let item = 1;
            try {
              
              await  this.mydb.select('st_log,st_users',['count(log_key)'],sql).then(res => {
                  
                  item = Math.ceil(Number(res[0]['count(log_key)'])/10);
              })  
              if (page >item) {
                  page = item;
              }
              if (page <= 0) {
                page = 1;
              }
              await this.mydb.select('st_log,st_users',['st_log.*','st_users.nickname']
              ,sql,[(page-1)*10],'ORDER BY log_time DESC LIMIT ?,10').then(res => {
                    res.forEach((elm,key) => {
                        res[key].log_time = this.datetime(elm.log_time);
                    });
                    resolve({
                        code:200,
                        mes : "select are data ",
                        data:{
                            page,
                            item,
                            desc:res
                        }
                    });
                },err => {
                    reject(err);
                })
            }catch(err) {
                throw err;
            }
        })
    },

    //批量删除日志
    dellog : function(data) {
        
        return new Promise(async (resolve ,reject ) => {
            try {
                let successful = [],failure = [];
                for (let i =0 ; i <data.length; i++) {
                    
                   await this.mydb.delete('st_log','log_key =?',[data[i]]).then(res => {
                        if (res.affectedRows != 0)  {
                            successful.push(data[i]);
                        }else {
                            failure.push(data[i]);
                        }
                    },err => {
                        throw err;
                    })
                    if (i == data.length-1) {
                        resolve({
                            code : 200,
                            mes : 'To deal with the data',
                            data:{
                                'ok':successful,
                                'no' : failure
                            }
                        })
                    }
                }
            }catch(err) {
                throw err;
            }
        })
    }
    


}

Object.setPrototypeOf(LogModel, require('./BaseModel'));

module.exports = LogModel;