
const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: body
  }
};

exports.handler = (event, context, callback) => {

  var aws_sts = new (require('../lib/aws/sts'))();
  var aws_config = new (require('../lib/aws/awsconfig.js'))();

  if (!event.federateRoleName)  event.federateRoleName = "federate";

  var roles = [];
  if (event.federateAccount) {
    roles.push({roleArn:'arn:aws:iam::' + event.federateAccount + ':role/' + event.federateRoleName});
    var admin_role = {roleArn:'arn:aws:iam::' + event.account + ':role/' + event.roleName};
    if (event.roleExternalId) {
      admin_role.externalId = event.roleExternalId;
    }
    roles.push(admin_role);
  }
  console.log(roles);

  var sessionName = event.sessionName;
  if (sessionName == null || sessionName == "") {
    sessionName = "session";
  }

  var input = {
    sessionName: sessionName,
    roles: roles,
    region: event.region
  };

  function succeeded(input) { callback(null, createResponse(200, true)); }
  function failed(input) { callback(null, createResponse(200, false)); }
  function errored(err) { callback(err, null); }

  var flows = [
    {func:aws_sts.assumeRoles, success:aws_config.findRecorders, failure:failed, error:errored},
    {func:aws_config.findRecorders, success:aws_config.findRecordersStatus, failure:failed, error:errored},
    {func:aws_config.findRecordersStatus, success:aws_config.findChannels, failure:failed, error:errored},
    {func:aws_config.findChannels, success:aws_config.findChannelsStatus, failure:failed, error:errored},
    {func:aws_config.findChannelsStatus, success:succeeded, failure:failed, error:errored},
  ];
  aws_sts.flows = flows;
  aws_config.flows = flows;

  flows[0].func(input);
};
