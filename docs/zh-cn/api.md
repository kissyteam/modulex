# api

## 注册模块

define 函数可用 commonjs 规范或类 amd 规范来使用，kmd是类似amd的一种模块定义规范。如下：

### commonjs规范写法

#### `define([name], [deps], factory)`

- name {String} 模块名称，可选
- deps {Array} 模块依赖，可选
- factory {Function|Object|String} 模块的主内容/逻辑。当为函数时，有三个参数 require,exports,module 。函数返回值就是注册的模块接口。

示例1：

```js
define('learn-modulex', ['node'], function(require, exports, module){
    var $ = require('node');
    module.exports = function(){
        console.log('Hi, modulex');
    }
});
```
示例2：
开发阶段不写上模块名称name和模块依赖deps，在发布到线上前在使用 [gulp-kmc](https://www.npmjs.com/package/gulp-kmc)  来生成模块名称和提取模块依赖。

```js
define(function(require, exports, module){
    var $ = require('node');
    module.exports = function(){
        console.log('Hi, modulex');
    }
});
```

### kmd规范写法，类似amd

#### `define([name], factory, [deps])`

- name {String} 模块名称，可选
- factory {Function|Object|String} 模块的主内容/逻辑。当为函数时，参数依次是模块依赖对象配置的模块接口。函数返回值就是注册的模块接口。
- deps {Object} 模块依赖对象配置

示例1：

```js
define('learn-modulex', function($, Cookie){
    return function(){
        console.log('Hi, modulex');
    }
},{
    requires : ['node', 'cookie']
});
```
*/


## 设置或获取配置参数

### 包配置对象包括：

 - group String类型 表示包所属的组名
 - filter {String} 文件名后缀，如 a.js -> a-debug.js
 - tag 类型字符串, 最好为时间戳, 用于刷新客户端本包的模块文件缓存
 - combine 类型Boolean, 如果总和 combine 设置为 true，但是单个包 combine 设置为 false，则该包内文件不进行自动 combo
 - 类型字符串, 表示包所在的 url 路径, 相对路径表示相对于当前页面路径.
 - path 作用同 base 配置
 - charset 类型字符串, 表示宝贝所有模块定义文件的编码格式, 默认 utf-8

### 单个模块配置对象包括：

 - requires 类型String,该模块的依赖模块名数组。当设置 combine 为 true 时需要配置，否则不建议配置.
 - alias {String|Array} 模块别名，当为数组时，合并数组中所有模块返回。
 - tag 类型 String，单个模块的时间戳。仅在 combine 为 false 时生效。 combine:true 时取对应包的 tag.

### 总配置范例概览

```js
require.config({
    // 开启自动 combo 模式
    combine:true,
    // base 路径库内置模块的时间戳
    tag:'2014',
    // base 的基准路径
    base:'http://x.com/a',
    packages:{
        x:{
            // x 包的基准路径
            base:'http://x.com/biz/',
            // x 包的时间戳
            tag:'x',
            // 添加后缀-debug
            filter:debug
        },
        y:{
           // y 包的基准路径
           base:'http://x.com/biz/',
           // y 包不开启自动 combo
           combine:false
           // 不配置 tag，则取 base 路径内置模块的时间戳
        }
    },
    modules:{
        "x/b1":{
            // "x/b1" 模块的依赖信息
            requires:["x/b2","x/b3"]
        },
        "y/b2":{
            // y/b2 模块单独的时间戳
            tag:'234'
        }
    }
});
```

### packages 范例: 包配置

```js
require.config({
    packages:{
        // 包名
        "tc": {
            tag:"20141015", // 动态加载包内的模块js文件时,
                            // 自动加上 ?t=20141015, 用于文件更新
            base:"../", // 包对应路径, 相对路径指相对于当前页面路径
            charset:"gbk" // 包里模块文件编码格式
        }
    }
});
```

## group组介绍概览

简单使用(如果想将多个包combo到一起，需要通过配置参数group来实现。例如，对于以下包进行combo：)

```js
require.config({
	packages:{
		"pkg-a": {
		    base: "http://example.com/pkg-a",
		    group: "group1",
		    combine: true,
		    tag: "20120222"
		},
		"pkg-b": {
		    base: "http://example.com/pkg-b",
		    group: "group1",
		    combine: true,
		    tag: "20130303"
		},
		"pkg-c": {
		    base: "http://example.com/pkg-c",
		    combine: true,
		    tag: "20111111"
		}
	}
})
```

由于pkg-a和pkg-b的group设置为”group1”，则 modulex 会对这两个包的模块进行combo。而pkg-c则单独combo。产生URL如下：

```
http://example.com/??pkg-a/mod1.js,pkg-a/mod2.js,pkg-b/mod1.js,...?t=-389697156.js
http://example.com/pkg-c/??mod1.js,...?t=20111111.js
```

其中，时间戳?t=-389697156.js是根据pkg-a和pkg-b的时间戳tag来计算的。如果修改了其中一个包的时间戳，则combo后的时间戳也会变化。

### 容错

极端情况下，即使要combo的包路径path没有统一的前缀，也没有关系，modulex 可以自动识别和容错，分别对两个包进行combo。例如：

```js
require.config({
	packages:{
		"pkg-a": {
		    base: "http://example.com/pkg-a",
		    group: "group2",
		    combine: true,
		    tag: "20120222"
		},
		"test": {
		    base: "http://g.tbcdn.cn",
		    group: "group2",
		    combine: true,
		    tag: "20130303"
		}
	}
})
```

 combo后的URL如下：

```
http://example.com/pkg-a/??mod1.js,mod2.js,...
http://g.tbcdn.cn/test/??mod1.js,...
```

## 方法

```js
/**
* 设置或获取配置参数
* @method config
* @static
* @param name {String} 参数名称. 取值范围参见上面函数
* @param value 参数值. 如果不设置则返回参数名称对应的参数值
* @return {Any} 如果设置了参数值无返回。否则返回参数名称对应的参数值.
*/

/**
* 动态加载目标地址的资源文件
* @method getScript
* @static
* @param url {String} js/css 的资源地址
* @param config {Object} 配置对象
* @param config.charset {String}  资源文件的字符编码
* @param config.success {Function} 资源加载成功后回调函数
* @param config.error {Function} 超时或发生错误时回调函数. 当资源文件为 css 文件时不支持
* @param config.timeout {Number}  单位为秒, 默认无限大. 超时后触发 error 回调. 当资源文件为 css 文件是不支持
* @return {HTMLElement} 创建的 link 节点或 script 节点
*/

/**
* 引用模块
* @method require
* @static
* @param modNames {Array} 如 require(['dom', 'anim'])
* @param callback {Object} 回调对象，包括成功与失败回调配置
* @param callback.success {Function} 当 modNames 中所有模块加载完毕后执行的函数
* @param callback.error {Function} 当前 require 失败时调用的函数，参数为失败的模块对象
*/
```

示例1：

```js
require(['depMod1','depMod2'],function(DepMod1,DepMod2){
});
require(['depMod1','depMod2'],{
    success:function(DepMod1,DepMod2){
    },
    error:function(){

    }
});
```

在define中异步引用模块 示例：

```js
define(function(require, exports, module){
    exports.onClick = function(){
        var modsArr = ['mod/a', 'mod/b'];
        require(modsArr, function(A, B){
            //when mod/a , mod/b loaded...
            //your code here
        });
    }
});
```

如果使用经过配置的包内的模块, 则这些包内模块不需要事先注册, 直接 require 即可, 如果模块名以 / 结尾, 则自动加后缀 index , 例如 require(["mods/m1/"]) 相当于 require(["mods/m1/index"]) , 即自动加载 m1 目录下的 index.js

## noConflict

use modulex.noConflict() to give up global require and define variable.

```js
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