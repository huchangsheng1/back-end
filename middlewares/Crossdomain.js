module.exports = function ( req, res, next) {
    //允许所有跨域
    res.header('Access-Control-Allow-Origin',"*");   //允许所有的可以 跨域
    res.header('Access-Control-Allow-Headers',"*");
    res.header('Access-Control-Allow-Methods',"*");
 
    

    res.setHeader("Access-Control-Expose-Headers" , "*");
    next();
  
}