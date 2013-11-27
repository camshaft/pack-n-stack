/**
 * Module dependencies.
 */

var http = require('http');
var util = require('util');

// prototype

var app = module.exports = {};

/**
 * Use middleware function
 *
 * @param {String|Function|Server} route, callback or server
 * @param {String} middleware name
 * @param {Function|Server} callback or server
 * @return {Server} for chaining
 * @api public
 */

app.use = function use(route, name, handle) {
  var middleware = defaults(route, name, handle);

  if(this.indexOf(middleware.name) !== -1) {
    throw new ExistsError(middleware.name);
  }

  this.stack.push(middleware);

  return this;
};


/**
 * Use middleware function before middleware by name
 *
 * @param {String} name
 * @param {String|Function|Server} route, callback or server
 * @param {String|Function|Server} handle name, callback or server
 * @param {Function|Server} callback or server
 * @return {Server} for chaining
 * @api public
 */

app.useBefore = function useBefore(beforeName, route, name, handle) {
  var middleware = defaults(route, name, handle);

  if(this.indexOf(middleware.name) !== -1) {
    throw new ExistsError(middleware.name);
  }

  var idx = this.indexOf(beforeName);

  if (idx === -1) throw new NotFoundError(beforeName);

  this.stack.splice(idx, 0, middleware);

  return this;
};


/**
 * Use middleware function after middleware by name
 *
 * @param {String} name
 * @param {String|Function|Server} route, callback or server
 * @param {String|Function|Server} handle name, callback or server
 * @param {Function|Server} callback or server
 * @return {Server} for chaining
 * @api public
 */

app.useAfter = function useAfter(afterName, route, name, handle) {
  var middleware = defaults(route, name, handle);

  if(this.indexOf(middleware.name) !== -1) {
    throw new ExistsError(middleware.name);
  }

  var idx = this.indexOf(afterName);

  if (idx === -1) throw new NotFoundError(afterName);

  this.stack.splice(idx + 1, 0, middleware);

  return this;
};


/**
 * Remove middleware function by name
 *
 * @param {String} name
 * @return {Server} for chaining
 * @api public
 */

app.remove = function remove(name) {
  var idx = this.indexOf(name);

  if (idx === -1) throw new NotFoundError(name);

  this.stack.splice(idx, 1);

  return this;
};


/**
 * Replace middleware function by name
 *
 * @param {String} name
 * @param {String} handle name
 * @param {Function|Server} callback or server
 * @return {Server} for chaining
 * @api public
 */

app.replace = function remove(name, handleName, handle) {
  var middleware = defaults('/', handleName, handle);

  var idx = this.indexOf(name);

  if (idx === -1) throw new NotFoundError(name);

  // Don't replace the route
  this.stack[idx].name = middleware.name;
  this.stack[idx].handle = middleware.handle;

  return this;
};


/**
 * Swap middleware functions by name
 *
 * @param {String} name
 * @param {String} name
 * @return {Server} for chaining
 * @api public
 */

app.swap = function swap(first, second) {
  var idx1 = this.indexOf(first);
  var idx2 = this.indexOf(second);

  if (idx1 === -1) throw new NotFoundError(first);
  if (idx2 === -1) throw new NotFoundError(second);

  var middleware = this.stack[idx1];
  this.stack[idx1] = this.stack[idx2];
  this.stack[idx2] = middleware;

  return this;
};

/**
 * Move a middleware before another one
 *
 * @param {String} first
 * @param {String} second
 * @return {Server} for chaining
 * @api public
 */

app.moveBefore = function moveBefore(first, second) {
  var idx1 = this.indexOf(first);
  var idx2 = this.indexOf(second);

  if (idx1 === -1) throw new NotFoundError(first);
  if (idx2 === -1) throw new NotFoundError(second);

  this.stack.splice(idx2, 0, this.stack.splice(idx1, 1)[0]);

  return this;
};

/**
 * Find index of middleware function by name
 *
 * @param {String} name
 * @return {Number}
 * @api public
 */

app.indexOf = function indexOf(name) {
  if (typeof name === 'function') {
    name = name.name;
  }

  if (!name) throw new NameError();

  for (var i = this.stack.length - 1; i >= 0; i--) {
    if (this.stack[i].name === name) return i;
    if (this.stack[i].handle.name === name) return i;
  };

  return -1;
};

/**
 * Lists the middleware in order
 * 
 * @return {Array} middleware names
 * @api public
 */
app.list = function list() {
  var middlewareList = [];

  this.stack.forEach(function(middleware) {
    middlewareList.push(middleware.name);
  });

  return middlewareList;
};

/**
 * Default the parameters
 *
 * @api private
 */

function defaults(route, name, handle) {
  if (typeof route === 'function') {
    handle = route;
    name = handle.name;
    route = '/';
  }
  else if (typeof name === 'function') {
    handle = name;
    name = handle.name;
  }

  // A name needs to be provided
  if (!name) throw new NameError();

  // wrap sub-apps
  if ('function' == typeof handle.handle) {
    var server = handle;
    handle.route = route;
    handle = function(req, res, next){
      server.handle(req, res, next);
    };
  }

  // wrap vanilla http.Servers
  if (handle instanceof http.Server) {
    handle = handle.listeners('request')[0];
  }

  // strip trailing slash
  if ('/' == route[route.length - 1]) {
    route = route.slice(0, -1);
  }

  return {route: route, name: name, handle: handle};
};

// errors

/**
 * Define an error for middleware not being named
 */
function NameError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'Middleware Name Error';
  this.message = message || 'The argument must be a named function or supply a name';
};
util.inherits(NameError, Error);

/**
 * Define an error for middleware already in the stack
 */
function ExistsError(name, message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'Middleware Exists Error';
  this.message = message || 'Middleware named ' + name + ' already exists. Provide an alternative name.';
};
util.inherits(ExistsError, Error);

/**
 * Define an error for middleware not found in the stack
 */
function NotFoundError(name) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'Middleware Not Found Error';
  this.message = name + ' not found in the current stack';
};
util.inherits(NotFoundError, Error);