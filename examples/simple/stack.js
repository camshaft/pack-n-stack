
var stack = require("../../")
  , connect = require("connect");

module.exports = function(config) {
  if (!config) config = {};

  // Create a pack
  var pack = stack();

  // Add some default middleware
  pack.use(connect.favicon());
  pack.use(connect.directory(config.static || __dirname));

  // Return the pack
  return pack;
};
