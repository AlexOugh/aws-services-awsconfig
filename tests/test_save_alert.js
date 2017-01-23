
/*
export TABLE_NAME=aws-services-awsconfig-DynamoDBTable-1XS5P1XNUG6CR
*/

event = {
  body: null,
}

var i = require('../index_save.js');
var context = null;
i.handler(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
