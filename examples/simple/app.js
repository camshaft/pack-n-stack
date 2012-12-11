
var connect = require("connect")
  , pack = require("./stack")();

var app = connect();

// Insert some custom middleware
pack.useBefore('favicon', connect.logger("dev"));

// Use the pack
app.use(pack);

var port = process.env.PORT || 3000;
console.log("Process listening on port "+port);
app.listen(port);
