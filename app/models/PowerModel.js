let PowerModel = {
    //添加角色权限表权限
    addModel: function (data,req) {
        return new Promise((resolve, reject) => {
            if (!data.rid || !data.p_id) {
                resolve({
                    code: '505',
                    mes: 'data is undefind!'
                })
                return;
            }
            try {
                this.mydb.find('st_rorp', ['rid', 'p_id'], 'rid=? and p_id = ?', [data.rid, data.p_id]).then( result => {
                    
                    if (result.p_id == data.p_id) {
                        resolve({
                            code: 507,
                            mes: 'power is exists'
                        })
                        return;
                    }
                    this.mydb.select('st_power,st_role',[
                        'st_role.rid',
                        'st_power.p_id'
                    ],'st_role.rid =? and st_power.p_id =?',[data.rid, data.p_id]).then(
                        res => {
                            if (res.length == 0) {
                                resolve({
                                    code:503,
                                    mes : 'rid or p_di is null '
                                })
                                return;
                            }
                            this.mydb.add('st_rorp', { 'rid': data.rid, 'p_id': data.p_id }).then(res => {
                                if (res.affectedRows > 0) {
                                    try {
                                        this.addlog(req,{
                                            'text':`添加了角色为${data.rid}权限为${data.p_id}权限 `,
                                            'type':1
                                        })
                                    }catch(err) {
                                        throw err
                                    }finally{
                                        resolve({
                                            code: 200,
                                            mes: 'power is end add ok'
                                        })
                                    }
                                    
                                    
                                } else {
                                    resolve({
                                        code: 506,
                                        mes: 'power is exists'
                                    })
                                };
                            }, err => { reject(err) })
                        },err => {
                            reject(err);
                        }
                    )
                    
                }, err => { reject(err) })

            } catch (err) {
                throw err;
            }
        })
    },
    //删除角色权限表权限
    delModel: function (data,req) {
        return new Promise((resolve, reject) => {
            if (!data.rid || !data.p_id) {
                resolve({
                    code: '505',
                    mes: 'data is undefind!'
                })
                return;
            }
            try {
                this.mydb.delete('st_rorp', 'rid=? and p_id=?', [data.rid, data.p_id])
                    .then(result => {
                        if (result.affectedRows > 0) {
                            try {
                                this.addlog(req,{
                                    'text':`删除了角色权限为${data.rid}的权限 `,
                                    'type':2
                                })
                            }catch(err) {
                                
                                throw err
                            }finally{
                                resolve({
                                    code: 200,
                                    mes: 'porwer  delete the ok!'
                                })
                            }
                            
                           
                        } else {
                            resolve({
                                code: 503,
                                mes: 'porwer is null!'
                            })
                        }
                    }, err => {
                        reject(err);
                    })
            } catch (err) {
                throw err;
            }
        })
    },
    //查找当角色权限表权限
    findModel: function (rid) {
        return new Promise((resolve, reject) => {
            if (!rid) {
                resolve({
                    code: '505',
                    mes: 'data is undefind!'
                })
                return;
            }
            try {
                this.mydb.select('st_rorp,st_power', ['st_rorp.p_id','st_power.p_name'], 'st_rorp.rid=? and st_power.p_id = st_rorp.p_id', [rid])
                    .then(result => {
                        if (result.length == 0) {
                            resolve({
                                code: 503,
                                mes: 'power is null',
                                data: result
                            })
                        } else {
                            resolve({
                                code: 200,
                                mes: 'power find yes !',
                                data: result
                            })
                        }
                    }, err => {
                        reject(err);
                    })
            } catch (err) {
                reject(err);
            }
        })
    },

    //权限表添加权限
    paddModel: function (p_name,p_key,menu,purl,req) {
        return new Promise(async (resolve, reject) => {
            try {
               await this.mydb.select('st_power',['p_name'],'p_name=?',[p_name]).then(res => {
                   if (res.length != 0) {
                     resolve({
                         code : 507,
                         mes : 'p_name is exists'
                     })
                     return ;
                   }
               })
                let data = {
                    "p_name" : p_name,
                    "p_key" : p_key,
                     "menu" : menu,
                }
                if (purl) {
                    data['purl'] = purl;
                }
               await this.mydb.add('st_power',data).then(res => {
                    if (res.affectedRows >0) {
                        resolve({
                            code : 200,
                            mes : 'power add db ok'
                        })
                    }else {
                        resolve(
                            {
                            code : 505,
                            mes : ' desc is type error'
                            }       
                        )
                    }
                },err => {
                    reject(err);
                })
            }catch(err) {
                reject(err);
            }
        })
    },
    //权限表删除权限
    pdelModel: function (data,req) {
        return new Promise((resolve, reject) => {
            if (!data.p_name) {
                resolve({
                    code: 503,
                    mes: 'power name is null'
                })
                return;
            }
            try {
                this.mydb.delete('st_power', 'p_name=?', [data.p_name])
                    .then(result => {
                        if (result.affectedRows > 0) {
                            try {
                                this.addlog(req,{
                                    'text':`删除了权限为${data.p_name}的权限 `,
                                    'type':2
                                })
                            }catch(err) {
                                throw err
                            }
                            resolve({
                                code: 200,
                                mes: 'porwer  delete the ok!'
                            })
                           
                        } else {
                            resolve({
                                code: 503,
                                mes: 'porwer is null!'
                            })
                        }
                    }, err => {
                        reject(err);
                    })
            } catch (err) {
                resolve({
                    code: 503,
                    mes: 'porwer is null!'
                })
                throw err;
            }
        })
    },

    //修改权限表权限
    palterModel: function (data,req) {
        return new Promise((resolve, reject) => {
            this.mydb.alter('st_power', data, 'p_name=?', [data.p_name])
                .then(res => {
                    if (res.affectedRows != 0) {
                        try {
                            this.addlog(req,{
                                'text':`修改了权限为${data.p_name}的权限 `,
                                'type':3
                            })
                        }catch(err) {
                            throw err
                        }finally{
                            resolve({
                                code: 200,
                                mes: 'power is alter yes'
                            })
                        }
                        
                        
                    } else {
                        resolve({
                            code: 503,
                            mes: 'power is null'
                        })
                    }
                }, err => {
                    reject(err);
                })
        })

    },

    //展示当前所有权限结构权限菜单
    pshowModel:  async function (p_key = 0) {

        let result = [];

        await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key'], 'p_key=? and menu=0', [p_key])
            .then(res => {
                result = res;
            });
        for (let x = 0; x < result.length; x++) {
            await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key'], 'p_key=? and menu=0', [result[x].p_id])
                .then(
                    ress => {
                        result[x].children = ress;
                    }
                )
        }
        for(let i in result) {
            if (result[i].children.length == 0) {
                delete result[i];
            }
        }
        return result;
    },

    //展示当前权限结构2权限菜单
    pshowModel2: async function (data,rid) {
       
        let rdata = [];
        let dataList =[];
        await this.mydb.select('st_rorp,st_power',['st_power.p_name','st_rorp.p_id','st_power.p_key']
        ,'st_power.menu =0 and st_rorp.p_id=st_power.p_id and st_rorp.rid=?',[rid])
            .then(result => {
                rdata = result;
            },err => {
                throw err
            })
        let pdataarr = rdata;
       
        for(let i=0;i<rdata.length ; i++ ){
      
            if (rdata[i].p_key == 0) {
                pdataarr[i]['children'] = [];
              
            }
            for(let j=0;j<rdata.length ; j++ ){
                if (rdata[i].p_id ==rdata[j].p_key) {
                    pdataarr[i].children.push(rdata[j]);
                }
            }
        }
        pdataarr.forEach((item,key) => {
            
            if (!item.children || item.children.length == 0) {
                delete pdataarr[key];
            }
        })

        return pdataarr;
    },

    //角色表添加角色
    roleaddModel: function (data,req) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.find('st_role', ['rname'], 'rname=?', [data.rname]).then(res => {
                    if (res.rname) {
                        resolve({
                            code: 507,
                            mes: 'role is exists'
                        })
                        return;
                    }
                    this.mydb.add('st_role', { 'rname': data.rname }).then(res => {
                        if (res.affectedRows != 0) {
                            
                            try {
                                this.addlog(req,{
                                    'text':`增加了角色为${data.rname}的角色 `,
                                    'type':1
                                })
                            }catch(err) {
                                throw err
                            }finally{
                                resolve({
                                    code: 200,
                                    mes: 'role is add yes '
                                })
                            }
                        } else {
                            resolve({
                                code: 507,
                                mes: 'role is exists'
                            })
                        }
                    }, err => {
                        reject(err);
                    })
                }, err => {
                    reject(err);
                })
            } catch (err) {
                reject(err);
            }
        })
    },

    //角色表修改角色
    rolealterModel: function (data,req) {
     
        return new Promise((resolve, reject) => {
            try {
                this.mydb.select('st_role', ['rname'], 'rname =?', [data.rnametow]).then(res => {
                    if (res.length !=0) {
                        resolve({
                            code: 503,
                            mes: 'rname is null'
                        })
                        return;
                    }
                    this.mydb.alter('st_role', { 'rname': data.rnametow }, 'rid=?', [data.rid]).then(res => {
                        if (res.affectedRows > 0) {
                            
                            try {
                                this.addlog(req,{
                                    'text':`修改了角色为${data.rid}的角色名为${data.rnametow} `,
                                    'type':3
                                })
                            }catch(err) {
                                throw err
                            }finally{
                                resolve({
                                    code: 200,
                                    mes: 'role is alter yes'
                                })
                            }
                        } else {
                            resolve({
                                code: 503,
                                mes: 'role is null'
                            })
                        }
                    }, err => {
                        reject(err);
                    })
                })
            } catch (err) {
                reject(err);
            }
        })
    },

    //角色表删除角色
    roledelModel: function (data,req) {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.delete('st_role', 'rid=?', [data.rid]).then(res => {
                    if (res.affectedRows > 0) {
                        try {
                            this.addlog(req,{
                                'text':`删除了角色id为${rid}的角色 `,
                                'type':2
                            })
                        }catch(err) {
                            throw err
                        }finally{
                            resolve({
                                code: 200,
                                mes: 'role is del yes'
                            })
                        }
                        
                    } else {
                        resolve({
                            code: 503,
                            mes: 'role is null'
                        })
                    }
                }, err => {
                    reject(err);
                })
            } catch (err) {
                reject(err);
            }
        })
    },
    //角色表查出所有角色
    roleshowModel: function () {
        return new Promise((resolve, reject) => {
            try {
                this.mydb.query('select rid,rname from st_role').then(res => {
                    if (res.length != 0) {
                        resolve({
                            code: 200,
                            mes: 'select show is yes ',
                            data: res
                        })
                    } else {
                        resolve({
                            code: 404,
                            mes: 'resources is select err'
                        })
                    }
                }, err => {
                    reject(err);
                })

            } catch (err) {
                throw err
            }
        })
    },
    
    //通过角色id获取该角色的当前所有权限
    getrolepowerModel(rid) {
        return new Promise(async (resolve,reject) => {
            try{
                let pidArr = [];
                if (rid != 1) {
                    await this.mydb.select('st_rorp,st_power',
                    ['st_power.p_id','st_power.p_name','p_key']
                    ,'st_power.menu =0 and st_rorp.p_id=st_power.p_id and st_rorp.rid =?',[rid])
                    .then(res => {
                        pidArr = res;
                    },err => {
                        reject(err);
                    })
                    for(let i=0;i<pidArr.length;i++) {
                        await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key'], 'p_key=? and menu=0', [pidArr[i].p_id])
                        .then(
                           async ress => {
                                for(let i=0; i<ress.length ;i++) {
                                    await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key','purl'],'p_key=? and menu=1',[ress[i].p_id])
                                    .then(response => {
                                      
                                        ress[i].children = response;
                                    },err => {
                                        reject(err);
                                    })
                                }
                                pidArr[i].children = ress;
                            }
                        ,err => {
                            reject(err);
                        })
                    }
                    let pidArr2 = [];
                    pidArr.forEach((item,key) =>{
                        if (item.p_key == 0) {
                            pidArr2.push(item);
                        }
                    })
                    resolve({
                        code :200,
                        mes : 'power desc is find mi',
                        data : pidArr2
                    })

                }
            
                let result = [],p_key=0;

                await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key'], 'p_key=? and menu=0', [p_key])
                    .then(res => {
                        result = res;
                    },err => {
                        reject(err);
                    });
                
                for (let x = 0; x < result.length; x++) {
                    await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key'], 'p_key=? and menu=0', [result[x].p_id])
                        .then(
                           async ress => {
                                for(let i=0; i<ress.length ;i++) {
                                    await this.mydb.select('st_power', ['p_id', 'p_name', 'p_key','purl'],'p_key=? and menu=1',[ress[0].p_id])
                                    .then(response => {
                                        ress[i].children = response;
                                    },err => {
                                        reject(err);
                                    })
                                }
                                result[x].children = ress;
                            }
                        ,err => {
                            reject(err);
                        })
                    }
                
                    
                resolve({
                    code :200,
                    mes : 'power desc is find mi',
                    data : result
                })
            }catch(err) {
                reject(err);
            }

        })
    },

    // 更改权限名
    setpowername(p_id,p_name) {
        return new  Promise((resolve,reject) => {
            try {
                this.mydb.alter('st_power',{'p_name':p_name},'p_id=?',[p_id]).then(res => {
                    if (res.affectedRows > 0) {
                        resolve({
                            code : 200,
                            mes : ' power the name is alter ok'
                        })
                    }else {
                        resolve({
                            code : 503,
                            mes : ' power is null'
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
    //单纯返回权限菜单
    powermenu(){
        return new Promise((resolve,reject) =>{
            try {
                this.mydb.select('st_power',['p_id as value','p_name as label','p_key'],'menu=0').then(res => {
                    resolve({
                        code : 200,
                        mes : 'power menu is find data',
                        data : res
                    })
                },err => {
                    reject(err);
                })
            }catch(err){
                reject(err);
            }
        })    
    },
    //添加角色和添加把权限也添加了
    roleandpow(rname,data,req){
        return new Promise(async (resolve,reject) => {
            try {
               await this.mydb.select('st_role',['rname'],'rname=?',[rname]).then(res =>{
                     
                     if (res.length != 0) {
                         resolve({
                             code :507,
                             mes : 'rname is exists'
                         })
                         return;
                     }
               },err => {reject(err)})
            
               await this.mydb.add('st_role',{'rname':rname}).then(res => {
                   if (res.affectedRows <=0) {
                        resolve({
                            code :505,
                            mes : 'rname add is error'
                        })
                        return;
                   }
               },err => {reject(err)})

               let rid = '';
               try {
                await this.mydb.select('st_role',['rid'],'rname=?',[rname]).then(res => {
                    rid  = res[0].rid ;   
               },err => {reject(err)})
               }catch(err) {
                   reject(err);
               }
               if (data.length == 0) {
                    resolve({
                        code :200,
                        mes : 'role is create add'
                    })
               }
               let setdata = new Set();
               for(let i=0;i<data.length;i++){
                   if (data[i].path.length == 1) {
                       setdata.add(data[i].path[0])
                   }else if (data[i].path.length == 2) {
                    setdata.add(data[i].path[0]);
                    setdata.add(data[i].path[1]);
                   }else if (data[i].path.length == 3) {
                    setdata.add(data[i].path[0]);
                    setdata.add(data[i].path[1]);
                    setdata.add(data[i].path[2]);
                   }
               }
               let powlist =  [...setdata];

               let sql = `insert into st_rorp (rid,p_id) values `;
               for(let i=0 ; i<powlist.length;i++){
                let  ql ='';   
                if (i==0) {
                    ql = ` (${rid},${powlist[i]})`
                }else {
                    ql = `, (${rid},${powlist[i]}) `
                } 
                   sql = sql + ql
               }
               this.mydb.query(sql).then(res => {
                   if (res.affectedRows > 0) {
                       try{
                            resolve({
                                code :200,
                                mes : 'role is create and power en add'
                            })
                       }finally{
                           this.addlog(req,{"text":`添加了角色名为${rname}的角色`,"type":1});
                       }
                   }else {
                        resolve({
                            code : 509,
                            mes : 'power is add error'
                        })
                   }
               },err => {
                   reject(err)
               })
               
            }catch(err) {
                reject(err);
            }
        })
    },
    //更新角色权限
    updatepow(rid,data,req){
        return new Promise(async (resolve,reject) => {
            try {
                let powarr = [];
                await this.mydb.select('st_rorp',['rid','p_id'],'rid=?',[rid]).then(res =>{
                    if (res.length == 0) {
                        resolve({
                            code :507,
                            mes : 'rid is null'
                        })
                        return;
                    }else {
                        powarr = res;
                    }
                
              },err => {reject(err)})

              try{
                await this.mydb.delete('st_rorp','rid=?',[rid]).then(res => {
                },err => {
                    throw err;
                })
              }catch(err) {
                 reject(err);
              }

              if (data.length == 0) {
                  resolve({
                    code :200,
                    mes : 'role  the power is update'
                })
              }

              let setdata = new Set();
              for(let i=0;i<data.length;i++){
                  if (data[i].path.length == 1) {
                      setdata.add(data[i].path[0])
                  }else if (data[i].path.length == 2) {
                   setdata.add(data[i].path[0]);
                   setdata.add(data[i].path[1]);
                  }else if (data[i].path.length == 3) {
                   setdata.add(data[i].path[0]);
                   setdata.add(data[i].path[1]);
                   setdata.add(data[i].path[2]);
                  }
              }
              let powlist =  [...setdata];
            
              let sql = `insert into st_rorp (rid,p_id) values `;
               for(let i=0 ; i<powlist.length;i++){
                let  ql ='';   
                if (i==0) {
                    ql = ` (${rid},${powlist[i]})`
                }else {
                    ql = `, (${rid},${powlist[i]}) `
                } 
                   sql = sql + ql
               }
               this.mydb.query(sql).then(res => {
                   if (res.affectedRows > 0) {
                      try{ resolve({
                           code :200,
                           mes : 'role  the power is update'
                       })
                    }finally{
                        this.addlog(req,{"text":`修改了角色名为${rname}的角色`,
                                "type" : 3
                        });
                    }
                   }else {
                        resolve({
                            code : 509,
                            mes : 'power is update error'
                        })
                   }
               },err => {
                   reject(err)
               })

            }catch(err) {
                reject(err);
            }
        })
    }   
    
}

Object.setPrototypeOf(PowerModel, require('./BaseModel'));

module.exports = PowerModel;