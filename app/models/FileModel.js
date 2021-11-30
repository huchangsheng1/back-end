const fs  = require('fs');
const path = require('path');
const myfs = require('../../utils/MyFS');
const string_random = require('string-random');
const { mydb } = require('./BaseModel');
let pathrul = path.join(__dirname, '../../', 'public', 'resources', 'netdisk');


let filemodel = {
  
    //渲染网页的操作
    get_render_disk: async function(render_disk_data){  
        try{
            let dirpath = path.join(pathrul,render_disk_data.gname);
            if (render_disk_data.net_disk_path == '/') {
                dirpath = path.join(pathrul,render_disk_data.gname)
            }else {
                dirpath = path.join(pathrul,render_disk_data.gname,render_disk_data.net_disk_path);
            }
            return await myfs.promise_readdir(dirpath)
        } catch(err){
          
            if (err) throw err;

            return {
                code:400,
                msg:'渲染失败!',
                errmes:'Data not found, page rendering failed!'
            }
            
        }
        
    },

    //创建目录请求
    post_new_file : async function (new_file_data) {
        try{
            let dirPath = '';
            let genpath = new_file_data.net_disk_path;
            if (genpath == '/') {
                dirPath = path.join(pathrul,new_file_data.gname,new_file_data.filename)
            }else {
                genpath = genpath.substr(1);
                dirPath = path.join(pathrul,new_file_data.gname,genpath,new_file_data.filename)
            }
            if (fs.existsSync(dirPath)){
                return {code:400,mes:'dirname is exist'};
            }
            return await myfs.promise_dir(dirPath);
        } catch(err){
            if (err) throw err;
        }
        
    },

    //上传文件
    post_file_upload: function(file_upload_data){
        
        try{
            let file_upload_type = [
                'application/pdf',
                'video/mp4'
            ]

 
            let file_upload_name = string_random(10) + file_upload_data.name;
            
            if (file_upload_type.indexOf(file_upload_data.type) < 0) {
                return  {
                    code:401,
                    msg:'暂不支持此格式！',
                    errmes:`This format is not supported at this time in (${file_upload_data.type})`
                }
            } else if (file_upload_data.size > 5000000000000) {
                return {
                    code:402,
                    msg:'文件过大！',
                    errmes:`The file is too large in (${file_upload_data.size})`
                }
            }
            if (file_upload_type.indexOf(file_upload_data.type) == 1) {
                fs.createReadStream(file_upload_data.path)
                .pipe(fs.createWriteStream(path.join(__dirname, '../../public/resources/video/', file_upload_name)))
                return {
                    code:200,
                    msg:'ok',
                    data:[
                        {
                            filesrc:file_upload_name
                        }
                    ]
                } 

            }
            
            fs.createReadStream(file_upload_data.path)
            .pipe(fs.createWriteStream(path.join(__dirname, '../../public/resources/ppt/', file_upload_name)))
            return {
                code:200,
                msg:'ok',
                data:[
                    {
                        filesrc:file_upload_name
                    }
                ]
            } 
        } catch(err){
            if (err) throw err;
        }
        
        
    },


    //删除文件
    post_delete_dir: function(pathsrc, key) {
    
        try{
            return new Promise( (resolve, reject) => {
   
                try {
                    fs.unlink(pathsrc, (err) => {
                        if (err) {
                            throw err
                        }

                        mydb.delete('st_resources','resources_key=?',[key]).then(
                            result => {
                       
                                resolve({
                                    code: 200,
                                    msg: 'ok'
                                })
                            }
                        )
                       
                    }) 
                   
                }catch(err) {
                    throw err
                }

            })
        } catch(err){
            if(err) throw err;

        }

        	
    }




};

module.exports = filemodel;
