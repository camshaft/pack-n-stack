
var stack = require("../../")
    express = require("express");

module.exports = function(config) {
  if (!config) config = {};

  // Create a pack
  var pack = stack();

  // Add some default middleware
  pack.use(express.favicon());

  // Use the express router
  if(config.router) pack.use(config.router);

  // Error handling
  pack.use(function notFound(req, res) {
    res.status(404);
    res.end("<h1>Custom 404 Page</h1><p>"+req.url+" not found</p>");
  });
  pack.use(express.errorHandler());

  // Return the pack
  return pack;
};
