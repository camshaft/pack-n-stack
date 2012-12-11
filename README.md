Pack 'n Stack [![Build Status](https://secure.travis-ci.org/CamShaft/pack-n-stack.png?branch=master)](https://travis-ci.org/CamShaft/pack-n-stack)
=============

Distributable and configurable connect stacks


Why
---

Because configuring a default stack for many apps is hard. At the same time we need to allow configuration if necessary.

Pack 'n Stack allows an organization to setup default stacks for different types of applications and gives the freedom to applications to modify those stacks based on the app's needs.

Check out the [examples](https://github.com/CamShaft/pack-n-stack/tree/master/examples)!

API
---

### .use(route, name, handle)

Works similar to `connect.use` except it takes a `name` parameter for identifying middleware. If a name is not passed, it defaults to the name of the function. Either must be present.

### .useBefore(name, route, handleName, handle)

Inserts `handle` before the middleware named `name`

### .useAfter(name, route, handleName, handle)

Inserts `handle` after the middleware named `name`

### .remove(name)

Removes the middleware named `name`

### .replace(name, handleName, handle)

Replaces the middleware named `name` by handleName and handle

### .swap(first, second)

Swap middleware functions by name

### .indexOf(name)

Find index of middleware function by name


Example
-------

```js
// my-stack.js

var stack = require("pack-n-stack")
    connect = require("connect");

module.exports = function(config) {
  if (!config) config = {};

  // Create a pack
  var pack = stack();

  // Add some default middleware
  pack.use(connect.favicon(config.favicon));
  pack.use(connect.directory(config.static || __dirname));

  // Return the pack
  return pack;
};
```

```js
// app.js
var connect = require("connect")
  , pack = require("my-stack")();

app = connect();

// Insert some custom middleware
pack.useBefore('favicon', connect.logger("dev"));

// Use the pack
app.use(pack);

var port = process.env.PORT || 3000;
console.log("Process listening on port "+port);
app.listen(port);
```