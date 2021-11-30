const express = require('express');
const router = express.Router();
const urllib = require('url');



router.use(function (req, res, next) {
  if (req.method == 'OPTIONS') {
    res.send('ok!');
    return;
  }

  let reqUrlArr = urllib.parse(req.url, true).pathname.toLowerCase();
  reqUrlArr = reqUrlArr.split('/');
  let controller = reqUrlArr[1] ? reqUrlArr[1] : 'index';               //控制器
  let action = reqUrlArr[2] ? reqUrlArr[2] : 'index';

  let controllerName = '';
  let actionName = '';
  let controllerArr = controller.split('_');
  controllerArr.forEach(once => {
    controllerName += once[0].toUpperCase() + once.substr(1);
  })
  //方法
  actionName = req.method.toLowerCase() + '_' + action;    //什么请求的方法

  let controllerobj = {};
  
  try {
    controllerobj = require(`../app/controllers/${controllerName}Controllers`)
    
  } catch (err) {
    throw err;
  }
  if (controllerobj[actionName]) {
    controllerobj[actionName](req, res, next);
  } else {
    throw new Error(`Request Method ${controllerName} [${actionName}]`);
  }
})



module.exports = router;
