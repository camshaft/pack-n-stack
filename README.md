Pack 'n Stack [![Build Status](https://secure.travis-ci.org/CamShaft/pack-n-stack.png?branch=master)](https://travis-ci.org/CamShaft/pack-n-stack)
=============

Distributable and configurable middleware stacks

Check out the [examples](https://github.com/CamShaft/pack-n-stack/tree/master/examples)!


Why
---

Because configuring a default stack for many apps is hard. At the same time we need to allow configuration if necessary.

[Pack 'n Stack](https://github.com/CamShaft/pack-n-stack) allows an organization to setup default stacks for different types of applications and gives the freedom to applications to modify those stacks based on the app's needs.


API
---

### .use([route], [name], handle)

Works similar to [`connect.use`](https://github.com/senchalabs/connect) except it takes a `name` parameter for identifying middleware. If a `name` is not passed, it defaults to `handle.name`. Either must be present or an exception will be thrown.

### .useBefore(name, [route], [handleName], handle)

Inserts `handle` before the middleware named `name`

### .useAfter(name, [route], [handleName], handle)

Inserts `handle` after the middleware named `name`

### .remove(name)

Removes the middleware named `name`

### .replace(name, [handleName], handle)

Replaces the middleware named `name` by `handleName` and `handle`

### .swap(first, second)

Swap middleware functions by name

### .indexOf(name)

Find index of middleware function by `name`


License 
-------

(The MIT License)

Copyright (c) 2012 Cameron Bytheway &lt;cameron@nujii.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
