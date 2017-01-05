
/*
export BUCKET_NAME_POSTFIX=.awsconfig
export TOPIC_NAME=awsconfig-topic
export ASSUME_ROLE_POLICY_NAME=awsconfig_assume_role_policy
export ROLE_NAME=awsconfig-setup-role
export INLINE_POLICY_NAME=awsconfig_setup_policy
export DELIVERY_CHANNEL_NAME=default
export CONFIG_RECORDER_NAME=default
export SAVER_FUNCTION_NAME=aws-services-awsconfig-SaveAlertFunction-1XH3P7JWEEWP7
export SAVER_FUNCTION_ARN=arn:aws:lambda:us-east-1:089476987273:function:aws-services-awsconfig-SaveAlertFunction-1XH3P7JWEEWP7
*/

event = {
  body: null,
  federateAccount: "089476987273",
  account: "089476987273",
  region: "us-east-1"
}

var i = require('../index.js');
var context = null;
i.enable(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
