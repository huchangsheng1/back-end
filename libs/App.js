const express = require('express');
const path = require('path');
const logger = require('morgan');
const router = express.Router();
const multiparty = require('connect-multiparty')
const multipartyRouter= multiparty()
const indexRouter = require('../routes/index');
//中间件
const ErrorMiddleware = require('../middlewares/ErrorMiddleware');
const TokenMiddleware = require('../middlewares/TokenMiddleware');
const connect_multiparty = require('connect-multiparty')(); 
const Crossdomain = require('../middlewares/Crossdomain');
const VerifyPower = require('../middlewares/VerifyPower');
module.exports = {

    init: function (app) {
        
        app.use(express.static(path.join(__dirname, '..', 'public')));

        //允许跨域中间件
        app.all('*',Crossdomain);
        

        //post的请求中间件处理
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));

        

        //异常中间件
        app.use(ErrorMiddleware);
        // token验证中间件
        app.use(TokenMiddleware);

        // 权限验证中间件
        app.use(VerifyPower);

		//文件中间件
        app.use(connect_multiparty);
        app.use(multipartyRouter)
       

        //给app绑定几个路由
        app.use('/', indexRouter);

    },
    //项目引导
    run: function (app) {
        this.init(app);
    },
    //路由引导
    toutes: function () {
        
    }
}