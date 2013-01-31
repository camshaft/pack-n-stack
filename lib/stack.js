/*!
 * Pack 'n Stack
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var proto = require('./proto')
  , utils = require('./utils');

// expose createStack() as the module
exports = module.exports = createStack;

/**
 * Expose the prototype.
 */

exports.proto = proto;

/**
 * Create a new stack.
 *
 * @return {Function}
 * @api public
 */

function createStack(app) {
  if (!app) {
    throw new Error("Pack-n-stack requires an express/connect app");
  };
  
  app = utils.merge(app, proto);

  Object.defineProperty(app, "count", {
    get: function() {
      return app.stack.length;
    }
  });

  return app;
};
