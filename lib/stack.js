/*!
 * Pack 'n Stack
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var proto = require('./proto')
  , connect = require('connect');

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

function createStack() {
  function app(req, res, next) { return app.connect(req, res, next);};

  app = connect.utils.merge(app, proto);
  app.connect = connect();

  Object.defineProperty(app, "count", {
    get: function() {
      return app.connect.stack.length;
    }
  });

  return app;
};
