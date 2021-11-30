const mysql = require('mysql');
const { db } = require('../config/index');

const pool = mysql.createPool(db);

class MyDB {

    //conn执行SQL
    query(sql, params = [], once = false) {
        // console.log(sql);
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    conn.query(sql, params, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (once) {
                                resolve(result[0] || []);
                            } else {
                                resolve(result);
                            }
                            conn.release(); //归还
                        }
                    })
                }
            })
        })
    }

    /**
     * 新增数据
     * @param {string} tablename 表名
     * @param {object} data 新增数据
     * @returns {object}  Promise对象
     */
    add(tablename, data) {
        let sql = `INSERT INTO ${tablename}`;
        let field_name = '';
        let field_value = '';
        let params = [];
        for (let i in data) {
            field_name += (field_name == '') ? i : ',' + i;
            field_value += (field_value == '') ? '?' : ',?';
            params.push(data[i]);
        }
        sql += ` (${field_name}) VALUES (${field_value})`;
        return this.query(sql, params);

    }

    /**
     * 修改数据
     * @param {string} tablename 
     * @param {object} data 
     * @param {string} condition 条件
     * @param {Array} param 条件参数 可选
     * @returns {Object} Promise对象
     */
    alter(tablename, data, condition, param = []) {
        
        let sql = `UPDATE ${tablename} SET `;
        let field_name = '';
        let params = [];
        for (let i in data) {
            field_name += (field_name == '') ? `${i}=?` : `,${i}=?`;
            params.push(data[i]);
        }

        if (param.length > 0) {
            params = params.concat(param)
        }
        sql += ` ${field_name} WHERE ${condition}`;
        return this.query(sql, params);
    }


    /**
     * 删除数据
     * @param {String} tablename 表名
     * @param {String} condition 条件
     * @param {Array} params 条件参数 可选
     * @returns {Object} Promise对象
     */
    delete(tablename, condition, params = []) {

        return this.query(`DELETE FROM ${tablename} WHERE ${condition}`, params)
    }

    /**
     * 单表查询数据
     * @param {String} tablename 表名
     * @param {String|Array} fields 字段名
     * @param {String} condition 查询条件
     * @param {Array} params 条件参数 可选
     * @returns Promise对象
     */
    find(tablename, fields, condition, params = []) {
        
        //SELECT 列名1,列名2 FROM 表名 WHERE 查询条件（多条件用 and or） (ORDER BY 字段名 DESC(降序) (LIMIT 5));
        let field_name = '';
        if (fields instanceof Array) {
            fields.forEach((val) => {
                field_name += (field_name == '') ? val : `,${val}`
            })
        } else {
            field_name = fields;
        }

        let sql = `SELECT ${field_name} FROM ${tablename} WHERE ${condition}`

        return this.query(sql, params, true)
    }

    /**
     * 
     * @param {String} tablename 表名
     * @param {String|Array} fields 字段名
     * @param {String} condition 条件
     * @param {Array} params 条件参数 可选
     * @param {String} order 排序方式
     * @param {String} limit 
     * @returns 
     */
    
    select(tablename, fields, condition, params = [], order = '', limit = '') {
        let field_name = '';
        if (fields instanceof Array) {
            fields.forEach((val) => {
                field_name += (field_name == '') ? val : `,${val} `
            })
        } else {
            field_name = fields;
        }

        let sql = `SELECT ${field_name} FROM ${tablename} WHERE ${condition} ${order} ${limit}`;
        return this.query(sql, params)
    }


}

module.exports = MyDB;




