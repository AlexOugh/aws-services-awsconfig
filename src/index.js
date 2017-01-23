
var baseHandler = require('aws-services-lib/lambda/base_handler.js')

exports.handler = (event, context) => {
  baseHandler.handler(event, context);
}

baseHandler.get = function(params, callback) {

  var AWS = require('aws-sdk');
  var aws_config = new (require('aws-services-lib/aws/awsconfig.js'))();

  var input = {};
  if (params.region) input['region'] = params.region;
  if (params.Credentials) {
    const creds = JSON.parse(params.Credentials)
    input['creds'] = new AWS.Credentials({
      accessKeyId: creds.AccessKeyId,
      secretAccessKey: creds.SecretAccessKey,
      sessionToken: creds.SessionToken
    });
  }
  console.log(input)

  function succeeded(input) { callback(null, {result: true}); }
  function failed(input) { callback(null, {result: false}); }
  function errored(err) { callback(err, null); }

  var flows = [
    {func:aws_config.findRecorders, success:aws_config.findRecordersStatus, failure:failed, error:errored},
    {func:aws_config.findRecordersStatus, success:aws_config.findChannels, failure:failed, error:errored},
    {func:aws_config.findChannels, success:aws_config.findChannelsStatus, failure:failed, error:errored},
    {func:aws_config.findChannelsStatus, success:succeeded, failure:failed, error:errored},
  ];
  aws_config.flows = flows;

  flows[0].func(input);
};

baseHandler.post = function(params, callback) {

  var AWS = require('aws-sdk');
  var aws_bucket = new (require('aws-services-lib/aws/s3bucket.js'))();
  var aws_topic = new (require('aws-services-lib/aws/topic.js'))();
  var aws_role = new (require('aws-services-lib/aws/role.js'))();
  var aws_config = new (require('aws-services-lib/aws/awsconfig.js'))();
  var aws_lambda = new (require('aws-services-lib/aws/lambda.js'))();

  var assumeRolePolicyName = process.env.ASSUME_ROLE_POLICY_NAME;
  var inlinePolicyName = process.env.INLINE_POLICY_NAME;
  var deliveryChannelName  = process.env.DELIVERY_CHANNEL_NAME;
  var configRecorderName = process.env.CONFIG_RECORDER_NAME;
  var bucketName = params.account + process.env.BUCKET_NAME_POSTFIX + "." + params.region;
  var topicName = process.env.TOPIC_NAME;
  var functionName = process.env.SAVER_FUNCTION_NAME;
  var endpoint = process.env.SAVER_FUNCTION_ARN;
  var roleName = process.env.ROLE_NAME + "-" + params.region;

  var fs = require("fs");
  var assumeRolePolicyDocument = fs.readFileSync(__dirname + '/json/' + assumeRolePolicyName + '.json', {encoding:'utf8'});
  console.log(assumeRolePolicyDocument);
  var inlinePolicyDocument = fs.readFileSync(__dirname + '/json/' + inlinePolicyName + '.json', {encoding:'utf8'});
  console.log(inlinePolicyDocument);

  var input = {
    deliveryChannelName : deliveryChannelName,
    configRecorderName : configRecorderName,
    bucketName : bucketName,
    topicName : topicName,
    functionName : functionName,
    statementId: "sns_invoke",
    assumeRolePolicyName: assumeRolePolicyName,
    assumeRolePolicyDocument: assumeRolePolicyDocument,
    roleName : roleName,
    roleNamePostfix: (new Date()).getTime(),
    inlinePolicyName : inlinePolicyName,
    inlinePolicyDocument: inlinePolicyDocument,
    AccountId: params.federateAccount,
    roleArn : null,
    topicArn : null,
    sourceArn : null,
    inlinePolicyDoc : null,
    protocol: "lambda",
    endpoint: endpoint
  };
  if (params.region) input['region'] = params.region;
  if (params.Credentials) input['creds'] = new AWS.Credentials({
    accessKeyId: params.Credentials.AccessKeyId,
    secretAccessKey: params.Credentials.SecretAccessKey,
    sessionToken: params.Credentials.SessionToken
  });
  console.log(input)

  function resetAuth(input) {
    input.creds = null;
    input.sourceArn = input.topicArn;
    aws_lambda.findFunction(input);
    console.log(input);
  }

  function succeeded(input) { callback(null, createResponse(200, true)); }
  function failed(input) { callback(null, createResponse(200, false)); }
  function errored(err) { callback(err, null); }

  var flows = [
    {func:aws_role.findRoleByPrefix, success:aws_role.findInlinePolicy, failure:aws_role.createRole, error:errored},
    {func:aws_role.createRole, success:aws_role.findInlinePolicy, failure:failed, error:errored},
    {func:aws_role.findInlinePolicy, success:aws_bucket.findBucket, failure:aws_role.createInlinePolicy, error:errored},
    {func:aws_role.createInlinePolicy, success:aws_role.wait, failure:failed, error:errored},
    {func:aws_role.wait, success:aws_bucket.findBucket, failure:failed, error:errored},
    {func:aws_bucket.findBucket, success:aws_topic.findTopic, failure:aws_bucket.createBucket, error:errored},
    {func:aws_bucket.createBucket, success:aws_topic.findTopic, failure:failed, error:errored},
    {func:aws_topic.findTopic, success:aws_topic.addPermission, failure:aws_topic.createTopic, error:errored},
    {func:aws_topic.createTopic, success:aws_topic.addPermission, failure:failed, error:errored},
    {func:aws_topic.addPermission, success:aws_config.findRecorders, failure:failed, error:errored},
    {func:aws_config.findRecorders, success:aws_config.setRoleInRecorder, failure:aws_config.setRoleInRecorder, error:errored},
    {func:aws_config.setRoleInRecorder, success:aws_config.findChannels, failure:failed, error:errored},
    {func:aws_config.findChannels, success:aws_config.findRecordersStatus, failure:aws_config.setChannel, error:errored},
    {func:aws_config.setChannel, success:aws_config.findRecordersStatus, failure:failed, error:errored},
    {func:aws_config.findRecordersStatus, success:resetAuth, failure:aws_config.startRecorder, error:errored},
    {func:aws_config.startRecorder, success:resetAuth, failure:failed, error:errored},
    {func:resetAuth, success:aws_lambda.findFunction, failure:failed, error:errored},
    {func:aws_lambda.findFunction, success:aws_topic.isSubscribed, failure:failed, error:errored},
    {func:aws_topic.isSubscribed, success:succeeded, failure:aws_lambda.addPermission, error:errored},
    {func:aws_lambda.addPermission, success:aws_topic.subscribeLambda, failure:failed, error:errored},
    {func:aws_topic.subscribeLambda, success:succeeded, failure:failed, error:errored},
  ];
  aws_bucket.flows = flows;
  aws_topic.flows = flows;
  aws_role.flows = flows;
  aws_config.flows = flows;
  aws_lambda.flows = flows;

  flows[0].func(input);
};

baseHandler.delete = function(params, callback) {

  var AWS = require('aws-sdk');
  var aws_topic = new (require('aws-services-lib/aws/topic.js'))();
  var aws_config = new (require('aws-services-lib/aws/awsconfig.js'))();
  var aws_role = new (require('aws-services-lib/aws/role.js'))();
  var aws_lambda = new (require('aws-services-lib/aws/lambda.js'))();

  var inlinePolicyName = process.env.INLINE_POLICY_NAME;
  var topicName = process.env.TOPIC_NAME;
  var roleName = process.env.ROLE_NAME + "-" + params.region;
  var functionName = process.env.SAVER_FUNCTION_NAME;
  var saveFunctionArn = process.env.SAVER_FUNCTION_ARN;

  var input = {
    topicName : topicName,
    roleName : roleName,
    inlinePolicyName : inlinePolicyName,
    functionName : functionName,
    statementId: "sns_invoke",
    protocol: "lambda",
    endpoint: saveFunctionArn
  };
  if (params.region) input['region'] = params.region;
  if (params.Credentials) input['creds'] = new AWS.Credentials({
    accessKeyId: params.Credentials.AccessKeyId,
    secretAccessKey: params.Credentials.SecretAccessKey,
    sessionToken: params.Credentials.SessionToken
  });
  console.log(input)

  function succeeded(input) { callback(null, createResponse(200, true)); }
  function failed(input) { callback(null, createResponse(200, false)); }
  function errored(err) { callback(err, null); }

  var flows = [
    {func:aws_config.findRecorders, success:aws_config.findRecordersStatus, failure:aws_config.findChannels, error:errored},
    {func:aws_config.findRecordersStatus, success:aws_config.stopRecorder, failure:aws_config.findChannels, error:errored},
    {func:aws_config.stopRecorder, success:aws_config.findChannels, failure:failed, error:errored},
    {func:aws_config.findChannels, success:aws_config.deleteChannel, failure:aws_lambda.removePermission, error:errored},
    {func:aws_config.deleteChannel, success:aws_lambda.removePermission, failure:failed, error:errored},
    {func:aws_lambda.removePermission, success:aws_topic.findTopic, failure:aws_topic.findTopic, error:aws_topic.findTopic},
    {func:aws_topic.findTopic, success:aws_topic.listSubscriptions, failure:aws_role.findRoleByPrefix, error:errored},
    {func:aws_topic.listSubscriptions, success:aws_topic.unsubscribeAll, failure:aws_topic.deleteTopic, error:errored},
    {func:aws_topic.unsubscribeAll, success:aws_topic.deleteTopic, failure:aws_role.findRoleByPrefix, error:errored},
    {func:aws_topic.deleteTopic, success:aws_role.findRoleByPrefix, failure:failed, error:errored},
    {func:aws_role.findRoleByPrefix, success:aws_role.findInlinePolicy, failure:succeeded, error:errored},
    {func:aws_role.findInlinePolicy, success:aws_role.deleteInlinePolicy, failure:aws_role.findRole, error:errored},
    {func:aws_role.deleteInlinePolicy, success:aws_role.deleteRole, failure:failed, error:errored},
    {func:aws_role.deleteRole, success:succeeded, failure:failed, error:errored},
  ];
  aws_topic.flows = flows;
  aws_config.flows = flows;
  aws_role.flows = flows;
  aws_lambda.flows = flows;

  flows[0].func(input);
};
