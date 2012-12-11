
var stack = require("../../")
    express = require("express");

module.exports = function(config) {
  if (!config) config = {};

  // Create a pack
  var pack = stack();

  // Add some default middleware
  pack.use(express.favicon());
  pack.use(express.bodyParser());
  pack.use(express.methodOverride());

  // Use the express router
  if(config.router) pack.use(config.router);

  // Public Dir
  app.use(express.static(config.public || path.join(__dirname, 'public')));

  // Error handling
  pack.use(function notFound(req, res) {
    res.status(404);
    res.end("<h1>Custom 404 Page</h1><p>"+req.url+" not found</p>");
  });
  pack.use(express.errorHandler());

  // Return the pack
  return pack;
};
