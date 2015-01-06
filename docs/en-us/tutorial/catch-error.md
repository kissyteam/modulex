## error catch in modulex

there are two types of error in modulex:

1. loading error occurs when module file is absent.

2. initializing error occurs when module is initialized (only take effect in non-debug file: build/modulex.js). such as:
```js
define(function(require, module, exports){
    throw 1;
});
```


### examples

a.js:
```js
define(function(require){
    require('./b');
});
```

b.js
```js
define(function(){
    throw 1;
});
```

c.js: 404


### catch error in use

modulex provides `require` api to catch loading and initializing error:
```js
require('a', {
    success:function(){
    },
    error:function(errMod){
        // errMod.name === 'b'
    }
});

require('c', {
    success:function(){
    },
    error:function(errMod){
        // errMod.name === 'c'
    }
});
```

### catch error in hooks

modulex provides `onModuleError` as hook into module lifecycle to catch loading and initializing error:
```js
require.config({
    onModuleError:function(error){
        // error.type === 'init' or 'load'
        // error.exception === 1
        // error.module.name === 'b'
    }
});

require('a');
require('c');
```