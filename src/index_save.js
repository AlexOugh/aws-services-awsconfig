
const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: body
  }
};

exports.handler = function (event, context) {

  var dynamodb = new (require('aws-services-lib/aws/dynamodb.js'))();

  // var fs = require("fs");
  //  data = fs.readFileSync(__dirname + '/json/data.json', {encoding:'utf8'});
  //  data_json = JSON.parse(data);

  //  var region=data_json.region;

  console.log(event.Records[0].Sns);
  var message_json = JSON.parse(event.Records[0].Sns.Message);
  var region = event.Records[0].EventSubscriptionArn.split(":")[3];
  var messageId = event.Records[0].Sns.MessageId;
  var subject = event.Records[0].Sns.Subject;
  //  var message = message_json.newEvaluationResult;
  var message = event.Records[0].Sns.Message;
  var sentBy = event.Records[0].Sns.TopicArn;
  var sentAt = event.Records[0].Sns.Timestamp;
  //var awsid = null;
  var awsid = message_json.awsAccountId;
  //  var awsids = message_json.Trigger.Dimensions.filter(function(dimension) {
  //  return dimension.name == 'LinkedAccount';
  // });
  //  if (awsids[0])  awsid = awsids[0].value;
  // else awsid = message_json.AWSAccountId;
  //  var pattern = /\s{1,}COMPLIANT/;
  var non_complaint_pattern = /\s{1,}NON_COMPLIANT/;

  if (non_complaint_pattern.test(subject)) {

    console.log("Non_Complaint_Alert_Message_True...Saving in DB.");

    var current = new Date();
    var item = {
      "id": {"S": messageId},
      "awsid": {"S": awsid},
      "subject": {"S": subject},
      "message": {"S": message},
      "sentBy": {"S": sentBy},
      "sentAt": {"S": sentAt},
      //"createdAt": {"S": current.toISOString()},
      //"updatedAt": {"S": current.toISOString()},
      //"account": {"N": '0'},
      //"archivedBy": {"S": "none"}
    }
    console.log(item);

    var input = {
      region: region,
      tableName: process.env.TABLE_NAME,
      item: item
    };
    dynamodb.save(input, function(err, data) {
      if (err)  callback(err, null);
      else callback(null, createResponse(200, true));
    });
  }
  else{
    console.log("Non_Complaint_Alert_Message_False...Ignoring Alert Message.");
    callback(null, createResponse(200, true));
  }
}
