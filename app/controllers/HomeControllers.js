const home_model = require('../models/HomeModel');

module.exports = {
    //橱窗图
    get_homeimg: function(req , res, next){
        home_model.setimgModel().then(response => {
           
            res.send(response);
        },err => {
            throw err
        })
       
    },
    //获取学生的信息
    get_studentdesc(req,res,next){
        home_model.getstdescModel(req).then(response => {
            res.send(response);
        },err => {
            throw err
        })
    }

}