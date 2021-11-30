module.exports = function (err, req, res, next) {

    res.send({
      errno: err.status || 500,
      errmsg: err.message
    });
  
  }