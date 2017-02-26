
const credentials = {
  "AccessKeyId": "",
  "SecretAccessKey": "",
  "SessionToken": ""
};
const body = {
  "region": ""
};

var event = {
  "path": "/awsconfig",
  "httpMethod": "POST",
  "headers": {
    "credentials": new Buffer(JSON.stringify(credentials)).toString('base64')
  },
  "queryStringParameters": null,
  "body": JSON.stringify(body)
}

var i = require('../src/index.js');
var context = {succeed: res => console.log(res)};
i.handler(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
