const tencentcloud = require("tencentcloud-sdk-nodejs");

const smsClient = tencentcloud.sms.v20210111.Client

const clientConfig = {
  credential: {
    secretId: "AKIDSmz2whJm6LfkY6NN6YliYJyXtypSpvkH",
    secretKey: "IK6ctu65oHTP6XidHfmcBYeT2LN8euvg",
  },
  region: "ap-guangzhou",
  profile: {
    httpProfile: {
      endpoint: "sms.tencentcloudapi.com",
    },
  },
};

const client = new smsClient(clientConfig);
function smsfn(phone,smsnub) {
    console.log(phone,smsnub);
    return new Promise((resolve , reject) => {
          const params = {
            "PhoneNumberSet": [
              phone
            ],
            "SmsSdkAppId": "1400589787",   
            "SignName": "盛昌网",      
            "TemplateId": "1174537",       
            "TemplateParamSet": [         
              smsnub, "2"
            ]
        };
        client.SendSms(params).then(
          (data) => {
            resolve(data);
          },
          (err) => {
            reject("error", err);
          }
        );
    })
}

module.exports = smsfn;
