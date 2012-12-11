
var express = require("express")
  , stack = require("./stack");

app = express();

// Initialize the pack
var pack = stack({
  router: app.router
});

// Insert some custom middleware
pack.useBefore('favicon', express.logger("dev"));

// Use the pack
app.use(pack);

// Routes
app.get("/", function(req, res, next) {
  res.send("<h1>Hello Pack 'n Stack</h1><p>Love, Express</p>");
});

// Start the server
var port = process.env.PORT || 3000;
console.log("Process listening on port "+port);
console.log("Using middleware:\n\t[" + pack.list().join(",\n\t ") + "]");
app.listen(port);
