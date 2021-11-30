module.exports = {
    db:{    //数据库配置文件
        host:'localhost',
        port:3306,
        user:'root',
        password:'hcs2000.',
        database:'education',
        charset:'utf8',
        acquireTimeout:'15000'
    },
    baseUrl :'http://localhost:3000'
    ,
    token: {                                //token验证
        secretkey: 'jwtkey',                  //秘钥
        iat: Math.ceil(Date.now() / 1000),    //生效时间
        expiresIn: 24 * 2000,                 //过期时间
        unwantedurl: [
            '/user/login',
            '/user/loginsms'
        ]
    },
    sms:{       //短信配置文件
        credential: {
            secretId: "AKIDSmz2whJm6LfkY6NN6YliYJyXtypSpvkH",       //secretId密钥id
            secretKey: "IK6ctu65oHTP6XidHfmcBYeT2LN8euvg",          //secretKey密码
            },
            region: "ap-guangzhou",
            profile: {
            httpProfile: {
                endpoint: "sms.tencentcloudapi.com",
            },
        }
    },
    cryptomd:{          //加密配置文件
        key:'my-key',
        format:'aes192',
        hex:'hex'
    },
    //不分权限接口
    unwantedurl :['user/login',
    'user/loginsms',
    'user/usersetimg',
    'user/userimg',
    'user/personal',
    'user/echo',
    'home/studentdesc',
    'course/rendercourses',
    'course/foundchapters',
    'course/renderfoundcourses',
    'course/sectionresource',
    'course/selectcourses',
    'grade/find',
    'grade/findgrade',
    'grade/showst',
    'forum/addask',
    'forum/addreplay',
    'forum/delask',
    'forum/delreplay',
    'forum/showask',
    'forum/selectask',
    'forum/count',
    'task/viewhomework',
    'task/modifywork',
    'file/netdisk',
    'exam/stuexameach',
    'exam/awaitexam',
    'exam/startexam',
    'exam/submitanswer',
    'exam/showdetails',
    'exam/showtestpaper',
    'exam/viewscore',
    'exam/showsituation',
    'home/homeimg',
    'home/studentdesc',
    'course/setcourse',
    'task/teacherworks',
    'task/lookwork',
    'power/pshow'
    ]
}