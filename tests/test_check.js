
event = {
  body: null,
  region: "us-east-1"
}

var i = require('../index.js');
var context = null;
i.check(event, context, function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log("completed: " + JSON.stringify(data));
});
