# modulex

[![Build Status](https://secure.travis-ci.org/kissyteam/modulex.png?branch=master)](https://travis-ci.org/kissyteam/modulex)
[![Coverage Status](https://coveralls.io/repos/kissyteam/modulex/badge.png?branch=master)](https://coveralls.io/r/kissyteam/modulex?branch=master)

[![browser support](https://ci.testling.com/kissyteam/modulex.png)](https://ci.testling.com/kissyteam/modulex)

A module registration and load library used by kissy

## api

### config environment

```javascript
modulex.config({
    packages: {},
    modules: {}
});
```

### register module

#### commonjs style

```javascript
modulex.add(function(require,exports,module){
});
```

or use define function

``` javascript
var defined = modulex.add;
define(function(require,exports,module){
});
```

#### amd style

```javascript
modulex.add(function(X){
},{
    requires:['x']
});
```

### use module

```javascript
modulex.use(['x','u'],function(X,U){
});
```

## contribution

### prepare development environment

* npm install
* npm install -g gulp
* gulp server

### modify code

* modify source file inside lib

### run test cases

* open [http://localhost:8000/tests/runner.html](http://localhost:8000/tests/runner.html) to test
* open [http://localhost:8000/node_modules/node-jscover/lib/front-end/jscoverage.html?w=http://localhost:8000/tests/runner.html?coverage](http://localhost:8000/node_modules/node-jscover/lib/front-end/jscoverage.html?w=http://localhost:8000/tests/runner.html?coverage) to check test coverage

### pull request

* file an issue: [https://github.com/kissyteam/modulex/issues/new](https://github.com/kissyteam/modulex/issues/new)
* then pull request