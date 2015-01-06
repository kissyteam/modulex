# api


## config

### package base

```js
require.config({
    packages:{
        x:{
            'base':'/test',
            main:'main'
        }
    }
});
```

```js
require('x') => /test/main.js
require('x/y') => /test/y.js
```

### combine

```js
require.config({
    combine:true,
    packages:{
        'x':{
            'base':'/test',
            main:'main'
        }
    }
});
```

```js
require(['x/1','x/2']) => /test/??1.js,2.js
```

or set at package level

```js
require.config({
    combine:true,
    packages:{
        'x':{
            'base':'/test',
            main:'main'
        },
        'y':{
            'base':'/test2',
            combine:false,
            main:'main'
        }
    }
});
```

```js
require(['x/1','x/2','y/1','y/2']) => /test/??1.js,2.js and /test2/1.js and /test2/2.js
```

#### modules dependencies

only used for combo

```js
require.config({
    combine:true,
    packages:{
        x:{
            base:'/test'
        }
    },
    modules:{
        'x/1':{
            requires:['./2','./3']
        }
    }
})
```

```js
require('x/1') => /test/??1.js,2.js,3.js
```

## define

### commonjs style

```js
define(function(require,module,exports){
    var x = require('x');
    var z = require('./z');
    module.exports = x+z;
});
```

### amd style

```js
define(function(x,z){
    return x+z;
},{
    requires:['x','./z']
});
```

## loader

after config package, you can use package and modules asynchronously.

```js
require('x', function(x){
    console.log(x);
});
```

```js
require(['x','y'], function(x,y){
    console.log(x,y);
});
```

## noConflict

use modulex.noConflict() to give up global require and define variable.

``` javascript
var require = global.require;
var define = global.define;
global.require = modulex.use;
global.require.config = modulex.config;
global.define = modulex.add;
mx.noConflict = function () {
    global.require = require;
    global.define = define;
};
```