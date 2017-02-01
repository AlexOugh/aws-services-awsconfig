
const Credentials = {
  "AccessKeyId": "",
  "SecretAccessKey": "",
  "SessionToken": ""
};
const body = {
  "region": ""
};

event = {
  "path": "/awsconfig",
  "httpMethod": "DELETE",
  "headers": {
    "Credentials": JSON.stringify(Credentials),
  },
  "requestContext": {
    "authorizer": {
      "refresh_token": "1234",
      "principalId": "abcd"
    }
  },
  "body": JSON.stringify(body)
}

var i = require('../index.js');
var context = null;
i.disable(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
