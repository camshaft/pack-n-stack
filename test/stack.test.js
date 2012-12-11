var stack = require("../")
  , should = require("should")
  , request = require("supertest")
  , async = require("async")
  , connect = require("connect");

describe("stack", function() {
  var pack, app;

  // Some mock middleware functions
  function first(req, res, next) {next()};
  function second(req, res, next) {next()};
  function third(req, res, next) {next()};

  beforeEach(function() {
    pack = stack();
    app = connect();
    app.use(pack);
  });

  describe(".use(middleware)", function() {
    it("should append 'middleware' onto the stack", function() {
      pack.use(first);
      pack.use(second);
      pack.use(third);
      pack.count.should.equal(3);
    });
    it("should call 'middleware' in order they were added", function(done) {
      var calls = [];

      pack.use(function first(req, res, next) {
        calls.push(0);
        next();
      });
      pack.use(function second(req, res, next) {
        calls.push(1);
        next();
      });
      pack.use(function third(req, res, next) {
        calls.push(2);
        next();
      });

      request(app).get("/").end(function(err) {
        if (err) done(err);
        for (var i = calls.length - 1; i >= 0; i--) {
          calls[i].should.equal(i);
        };
        done();
      });

    });
    it("should infer 'middleware' function name", function() {
      pack.use(first);
      pack.use(second);
      pack.use(third);
      pack.indexOf('first').should.equal(0);
      pack.indexOf('second').should.equal(1);
      pack.indexOf('third').should.equal(2);
      pack.indexOf('fourth').should.equal(-1);
    });
    it("should warn about an anonymous 'middleware' function", function() {
      (function() { pack.use(function() {}) }).should.throw();
    });
    it("should complain about duplicate 'middleware' names", function() {
      pack.use(first);
      (function() { pack.use(first); }).should.throw();
    })
  });

  describe(".use(route, middleware)", function() {
    it("should mount 'middleware' at 'route'", function(done) {

      pack.use("/", function first(req, res, next) {
        if (req.url == "/") {
          res.end("/");
        }
        else {
          next();
        }
      });
      pack.use("/foo", function second(req, res, next) {
        res.end("/foo");
      });
      pack.use("/bar", function third(req, res, next) {
        res.end("/bar");
      });

      async.forEach(["/", "/foo", "/bar"], function(route, next) {
        request(app)
          .get(route)
          .expect(route)
          .end(next);
      }, done);
    });
  });

  describe(".use(route, name, middleware)", function() {
    it("should override 'middleware' name with 'name'", function() {
      pack.use("/", first);
      pack.use("/", "second", first);
    });
  });

  describe(".useBefore(name, middleware)", function() {
    it("should insert 'middleware' before 'name'", function() {
      pack.use(first);
      pack.use(third);
      pack.useBefore('third', second);
      pack.indexOf('first').should.equal(0);
      pack.indexOf('second').should.equal(1);
      pack.indexOf('third').should.equal(2);
    });
  });

  describe(".useBefore(name, route, middleware)", function() {
    it("should insert 'middleware' before 'name' on 'route'", function(done) {
      pack.use("/foo", first);
      pack.useBefore('first', '/foo', function second(req, res, next) {
        res.end("/foo");
      });

      async.forEach(["/foo"], function(route, next) {
        request(app)
          .get(route)
          .expect(route)
          .end(next);
      }, done);
    });
  });

  describe(".useBefore(name, route, middlewareName, middleware)", function() {
    it("should insert 'middleware' before 'name' on 'route' as 'middlewareName'", function(done) {
      pack.use("/foo", first);
      pack.useBefore('first', '/foo', 'bar', function second(req, res, next) {
        res.end("/foo");
      });

      pack.indexOf('bar').should.equal(0);

      async.forEach(["/foo"], function(route, next) {
        request(app)
          .get(route)
          .expect(route)
          .end(next);
      }, done);
    });
  });

  describe(".useAfter(name, middleware)", function() {
    it("should insert 'middleware' before 'name'", function() {
      pack.use(first);
      pack.use(third);
      pack.useAfter('first', second);
      pack.indexOf('first').should.equal(0);
      pack.indexOf('second').should.equal(1);
      pack.indexOf('third').should.equal(2);
    });
  });

  describe(".useAfter(name, route, middleware)", function() {
    it("should insert 'middleware' before 'name' on 'route'", function(done) {
      pack.use("/foo", first);
      pack.use("/foo", function third(req, res, next) {
        res.end("/bar");
      });
      pack.useAfter('first', '/foo', function second(req, res, next) {
        res.end("/foo");
      });

      async.forEach(["/foo"], function(route, next) {
        request(app)
          .get(route)
          .expect(route)
          .end(next);
      }, done);
    });
  });

  describe(".useAfter(name, route, middlewareName, middleware)", function() {
    it("should insert 'middleware' after 'name' on 'route' as 'middlewareName'", function(done) {
      pack.use("/foo", first);
      pack.use("/foo", function third(req, res, next) {
        res.end("/bar");
      });
      pack.useAfter('first', '/foo', 'bar', function second(req, res, next) {
        res.end("/foo");
      });

      pack.indexOf("bar").should.equal(1);

      async.forEach(["/foo"], function(route, next) {
        request(app)
          .get(route)
          .expect(route)
          .end(next);
      }, done);
    });
  });

  describe(".remove(name)", function() {
    it("should remove 'middleware' by 'name'", function() {
      pack.use(first);
      pack.use(second);
      pack.indexOf('second').should.equal(1);
      pack.remove('first');
      pack.indexOf('second').should.equal(0);
      pack.count.should.equal(1);
    });
  });

  describe(".replace(name, middleware)", function() {
    it("should replace 'middleware' by 'name'", function() {
      pack.use(first);
      pack.use(second);
      pack.replace('second', third);
      pack.count.should.equal(2);
      pack.indexOf('second').should.equal(-1);
      pack.indexOf('third').should.equal(1);
    });
  });

  describe(".swap(name, otherName)", function() {
    it("should swap places of the middleware by names", function() {
      pack.use(first);
      pack.use(second);
      pack.swap('second', 'first');
      pack.count.should.equal(2);
      pack.indexOf('second').should.equal(0);
      pack.indexOf('first').should.equal(1);
      pack.swap('second', 'first');
      pack.count.should.equal(2);
      pack.indexOf('second').should.equal(1);
      pack.indexOf('first').should.equal(0);
    });
  });

  describe(".list()", function() {
    it("should list the middleware in use and in order", function() {
      pack.use(first);
      pack.use(second);
      pack.use(third);
      var list = pack.list();
      list[0].should.equal("first");
      list[1].should.equal("second");
      list[2].should.equal("third");
    });
  });

});
