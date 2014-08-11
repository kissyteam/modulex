# modulex

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

execute the following commands at project folder:

* npm install
* npm install -g gulp
* gulp server
* modify source file inside lib
* open http://localhost:8000/modulex/tests/runner.html to test