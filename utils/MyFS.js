const fs = require('fs');

/**
 * @param {string} datafill 查出该文件 目录下所有文件和目录
 * @returns {object} Promise 对象 正确的回调 arrobj 是一个对象包数组
*/
function promise_readdir(datafill){
    return new Promise((resolve,reject) => {
       
        fs.readdir(datafill,function(err, files) {
            if (err) reject(err) ;
            if (files.length == 0 ) {
                resolve({'dir':[],'file':[]});
            }
            let arrobj = {'dir':[],'file':[]};
            files.forEach(async function(once,key){
                promise_stat(datafill+'/'+once).then(stat=>{
                    if (key == files.length-1){
                        resolve(arrobj);
                    }
                    if (stat.isFile()) {
                        arrobj['file'].push(once)
                    }
                    else if (stat.isDirectory()) {
                        arrobj['dir'].push(once)
                    }
                },err => {
                    reject(err);
                })
            })
        })
    })
}


/**
 * @param {string} datafill 查出该路径文件是否存在
 * @returns {object} Promise 对象 正确的回调 stat 是一个文件对象信息
*/
function promise_stat(datafill) {
    return new Promise((resolve,reject) =>{
        fs.stat(datafill,function (err, stat){
            if (err){
                reject(err);
            }else {
                resolve(stat);
               }
        })
    })
}

/**
 * @param {string} datafill 创建文件
 * @param {strng|number|object} 创建文件的文件内容
 * @returns {object} Promise 对象 正确的回调，返回状态码
*/
function promise_writeFile(datafill,str){
    return new Promise((resolve,reject) =>{
        fs.writeFile(datafill,str,function(err,data) {
            if (err) {
                reject(err);
            }else {
                resolve({code:200,mes:'file is ok'});
            }
        })
    })
}


/**
 * @param {string} datafill 创建文件夹路径
 * @returns {object} Promise 对象 正确的回调，返回状态码
*/
function promise_dir(datafill) {
    return new Promise((resolve,reject) => {
        fs.mkdir(datafill,{ recursive: true },err => {
            if (err) {
                reject(err);
            }else {
                resolve({code:200,mes:'dir is ok'});
            }
        })
    })
}

/**
 * @param {string} datafill  旧文件的名称
 * @param {string} datafill2 更改的名称
 * @returns {object} Promise 对象 正确的回调，返回状态码
*/
function promise_rename(datafill,datafill2){
    return new Promise((resolve,reject) => {
        if (datafill == datafill2) {
            resolve({code:400,mes:'filename there are'});
            return;
        }
        if (fs.existsSync(datafill2)){
            resolve({code:400,mes:'filename there are'});
            return;
        }
        if (!fs.existsSync(datafill)){
            resolve({code:400,mes:'filename there are'});
            return;
        }
        fs.rename(datafill,datafill2,(err) =>{
            if (err) {
                reject(err);
            }else {
                resolve({code:200,mes:'filename has update'});
            }   
        })
    })
}

/**
 * @param {string} datafill 删除文件或目录
 * @returns {object} Promise 对象 正确的回调，返回状态码
*/
function promise_rmfile(datafill,nub=0){
        try {
            if (nub == 0 && fs.statSync(datafill).isFile()){
                fs.unlinkSync(datafill);
                return {code :200,mes:'drop file ok'};
            }
            let arr = fs.readdirSync(datafill);
            for (let i = 0 ; i<arr.length ;i ++ ){
                if (fs.statSync(datafill+'/'+arr[i]).isDirectory()){
                    promise_rmfile(datafill+'/'+arr[i],nub+1);
                }else {
                    fs.unlinkSync(datafill+'/'+arr[i]);
                }
            }
            fs.rmdirSync(datafill);
            return {code :200,mes:'drop dir ok'};
        }catch(err) {
            return {err};
        }
}

/**
 * @param {string} datafill 复制文件或者目录的旧地址
 * @param {string} datafill2 复制文件或目录的新地址
 * @param {number} nub 递归的回调
 * @returns {object} Promise 对象 正确的回调，返回状态码
*/

function promise_copy(datafill,datafill2,nub) {
    if (datafill == datafill2) {
        return {code:401,mes:'file no mobile'}
    }
    if (!fs.existsSync(datafill) || !fs.existsSync(datafill2)) {
        return {code:401,mes:'file not zai'}
    }
    let datafillarr = datafill.split('/');
    if (fs.statSync(datafill).isFile() && nub == 0){
        fs.copyFileSync(datafill,datafill2+'/'+datafillarr[datafillarr.length-1]);
        return {code:200,mes:'copy file ok'};
    } 
    let thent = datafillarr[datafillarr.length-1];
    fs.mkdirSync(datafill2+thent);
    let arr = fs.readdirSync(datafill);
    for (let i =0 ; i<arr.length;i++){
        if (fs.statSync(datafill+'/'+arr[i]).isDirectory()){
            fs.mkdirSync(datafill2+arr[i]);
            promise_copy(datafill+'/'+arr[i],datafill2+thent+'/'+arr[i],nub+1);
        }else {
            fs.copyFileSync(datafill+'/'+arr[i],datafill2+thent+'/'+arr[i]);
        }
    }
    return {code:200,mes:'copy dir yes!'};
        
}

/**
 * @param {string} datafill 剪贴文件或者目录的旧地址
 * @param {string} datafill2 剪贴文件或者目录的新地址
 * @param {number} nub 递归的回调
 * @returns {object} Promise 对象 正确的回调，返回状态码
*/

async function  promise_shear(datafill,datafill2,nub) {
    try{
       await promise_copy(datafill,datafill2,nub);
       await promise_rmfile(datafill,nub);
        return {code:200,mes:'shear yes'};
    }catch {
        return {code:400,mes:'shear 失败！'};
    }
    
}


module.exports = {
    promise_readdir,
    promise_stat,
    promise_writeFile,
    promise_dir,
    promise_rename,
    promise_rmfile,
    promise_copy,
    promise_shear
}