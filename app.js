const createError = require('http-errors');
const express = require('express');

const app = express();

require('./libs/App').run(app);

app.listen(3000, function () {
  console.log('服务成功开启')
})
