/**
 * Module dependencies.
 */

var http = require('http');

// prototype

var app = module.exports = {};

// environment

var env = process.env.NODE_ENV || 'development';

// errors

/**
 * Define an error for middleware not being named
 */
function NameError(message) {
  this.name = "Middleware Name Error";
  this.message = message || "The argument must be a named function or supply a name";
};
NameError.prototype = Error.prototype;

/**
 * Define an error for middleware already in the stack
 */
function ExistsError(message) {
  this.name = "Middleware Exists Error";
  this.message = message || "Middleware with that name already exists. Provide an alternative name.";
};
ExistsError.prototype = Error.prototype;

/**
 * Define an error for middleware not found in the stack
 */
function NotFoundError(name) {
  this.name = "Middleware Not Found Error";
  this.message = name + " not found in the current stack";
};
NotFoundError.prototype = Error.prototype;


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
    throw new ExistsError();
  }

  this.connect.stack.push(middleware);

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
    throw new ExistsError();
  }

  var idx = this.indexOf(beforeName);

  if (idx === -1) {
    throw new NotFoundError(beforeName);
  }

  this.connect.stack.splice(idx, 0, middleware);

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
    throw new ExistsError();
  }

  var idx = this.indexOf(afterName);

  if (idx === -1) {
    throw new NotFoundError(afterName);
  }

  this.connect.stack.splice(idx+1, 0, middleware);

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

  if (idx === -1) {
    throw new NotFoundError(name);
  }

  this.connect.stack.splice(idx, 1);
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
  var middleware = defaults("/", handleName, handle);

  var idx = this.indexOf(name);

  if (idx === -1) {
    throw new NotFoundError(name);
  }

  // Don't replace the route
  this.connect.stack[idx].name = middleware.name;
  this.connect.stack[idx].handle = middleware.handle;

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

  if (idx1 === -1) {
    throw new NotFoundError(first);
  }
  if (idx2 === -1) {
    throw new NotFoundError(second);
  }

  var middleware = this.connect.stack[idx1];
  this.connect.stack[idx1] = this.connect.stack[idx2];
  this.connect.stack[idx2] = middleware;

  return this;
};


/**
 * Find index of middleware function by name
 *
 * @param {String} name
 * @return {Server} for chaining
 * @api public
 */

app.indexOf = function indexOf(name) {
  if(typeof name === "function") {
    name = name.name;
  }

  if(!name) throw new NameError();

  for (var i = this.connect.stack.length - 1; i >= 0; i--) {
    if(this.connect.stack[i].name === name) return i;
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

  this.connect.stack.forEach(function(middleware) {
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
  if (typeof route === "function") {
    handle = route;
    name = handle.name;
    route = "/";
  }
  else if (typeof name === "function") {
    handle = name;
    name = handle.name;
  }

  // A name needs to be provided
  if(!name) {
    throw new NameError();
  };

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
