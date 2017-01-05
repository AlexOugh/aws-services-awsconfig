
/*
export TABLE_NAME=aws-services-awsconfig-DynamoDBTable-1XS5P1XNUG6CR
*/

event = {
  body: null,
}

var i = require('../index.js');
var context = null;
i.save_alert(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
