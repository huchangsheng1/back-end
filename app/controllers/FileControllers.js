 const filemodel = require('../models/FileModel')
 const path = require('path')



let FileControllers = {
    //渲染当前文件(网盘)返回所有文件文件夹
    get_netdisk: function (req, res, next) {
        let netdisk_data = req.body
        if (!Object.keys(netdisk_data)[0]) {
            res.send({
                code:404,
                msg:'数据为空或undefined',
                errmes:`TypeError: Data is empty or undefined in (${req.body})`
            })
        } else {
            filemodel.get_render_disk(req.body).then(
                result => {
                    res.send(result)
                }
            )
        }
        
        
    },
    // 创建文件夹
    post_newfile: function (req, res, next) {
        filemodel.post_new_file(req.body).then(
            result => {
                res.send(result)
            }
        )
        
    },

     //上传视频、ppt资源,ptf
    post_fileupload: function (req, res, next) {
        
        if (req.files.file_data == '' || req.files.file_data == undefined) {
            res.send({
                code:405,
                msg:'数据为空或undefined！',
                errmes:`TypeError: Data is empty in (${req.files.file_data})`
            })

        } else {
            res.send(filemodel.post_file_upload(req.files.file_data))
        }
    },


    //删除视频、ppt
    post_deletedir: function (req, res, next) {
        console.log(req.body.sourcename);
        let sourcename = req.body.sourcename;
        let resourceskeys =  req.body.resources_key


        let ext = sourcename.substr(sourcename.lastIndexOf('.')+1);
        let dirname = (ext == 'mp4') ? 'video' : "ppt";

        let pathsrc = path.join(__dirname, '/../../public/resources/'+dirname+'/', sourcename);
        console.log(pathsrc,'zhang');

        filemodel.post_delete_dir(pathsrc, resourceskeys).then(
            result => {
                res.send(result)

            }
        )

    }

}

module.exports = FileControllers;