
/*
export TOPIC_NAME=awsconfig-topic
export ROLE_NAME=awsconfig-setup-role
export INLINE_POLICY_NAME=awsconfig_setup_policy
export SAVER_FUNCTION_ARN=arn:aws:lambda:us-east-1:089476987273:function:aws-services-awsconfig-SaveAlertFunction-1XH3P7JWEEWP7
*/

event = {
  body: null,
  region: "us-east-1"
}

var i = require('../index.js');
var context = null;
i.disable(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
