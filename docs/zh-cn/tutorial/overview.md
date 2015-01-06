# modulex 基本介绍

modulex 是新一代的模块加载器，可单独使用。实际上，KISSY的种子文件 seed.js 是由 modulex + feature + ua + meta 四个部分组成的。如果选择使用KISSY，引入了seed.js则不再需要额外引入modulex。seed.js是KISSY的种子文件，引用它则可以方便使用KISSY提供的各种模块，如 anim , dom , event-dom 等。而 modulex 是一个模块加载器，如果你只是需要模块加载功能，也可以直接单独使用 modulex。更多信息可以查看 [modulex on github](https://github.com/kissyteam/modulex)。modulex 始终作为一个全局对象存在页面的生命周期。

## 使用方法

### 注册模块

### `define`

define 函数可用 cmd 规范或 类 amd 规范来使用，kmd是类似amd的一种模块定义规范。如下：

#### cmd规范写法

### `define([name], [deps], factory)`

- name {String} 模块名称，可选
- deps {Array} 模块依赖，可选
- factory {Function|Object|String} 模块的主内容/逻辑。当为函数时，有三个参数 require,exports,module 。函数返回值就是注册的模块接口。

示例1：

	define('learnkissy', ['node'], function(require, exports, module){
		var $ = require('node');

		module.exports = function(){
			console.log('Hi, modulex');
		}
	});

示例2：

开发阶段不写上模块名称name和模块依赖deps，在发布到线上前在使用 [gulp-kmc](https://www.npmjs.com/package/gulp-kmc) 来生成模块名称和提取模块依赖。

	define(function(require, exports, module){
		var $ = require('node');

		module.exports = function(){
			console.log('Hi, modulex');
		}
	});

#### kmd规范写法，类似amd

### `define([name], factory, [deps])`

- name {String} 模块名称，可选
- factory {Function|Object|String} 模块的主内容/逻辑。当为函数时，参数依次是模块依赖对象配置的模块接口。函数返回值就是注册的模块接口。
- deps {Object} 模块依赖对象配置

示例1：

	define('learn-modulex', function($, Cookie){
		return function(){
			console.log('Hi, modulex');
		}
	},{
		requires : ['node', 'cookie']
	});

### 引用模块

### `require(name, callback)`

- name {Array} 要引用的模块名称数组
- callback {Function} 成功加载所有模块后的回调函数，回调函数的参数依次是引用的模块的接口

示例：

	require(['dom', 'anim'], function(Dom, Anim)){
		//use Dom , Anim
	}

### 在define中异步引用模块

示例：

	define(function(require, exports, module){
		exports.onClick = function(){
			var modsArr = ['mod/a', 'mod/b'];
			require(modsArr, function(A, B){
				//when mod/a , mod/b loaded...
				//your code here
			});
		}
	});

### 让出define/require控制权

### `modulex.noConflict`

引入 modulex 后（或引入KISSY种子文件seed.js），默认define/require 关键词是modulex使用，若需要让出它们的控制权给例如 requirejs , seajs 等类库使用，可调用 modulex.noConflict() 方法。

### 配置

### `require.config(cfg)`

- cfg {Object} 配置对象
 - [filter] {String} 文件名后缀
 - [group] {String} 所有包的默认组配置，group的介绍详见下面的Note:group介绍
 - [base] {String} 整个类库所在的基地址
 - [comboMaxUrlLength=1024] {Number} Combo url 的最长长度，默认 1024
 - [comboPrefix="??"] {String} Combo 前缀，默认 ”??”
 - [comboSep=","] {String} Combo 分隔符，默认 ”,”
 - [tag] {String}  modulex base 路径内置模块请求的时间戳
 - [combine=false] {Boolean} 是否开启自动 combo 模式，默认 false 不开启. 自动 combo 模式要求 use 前配置好依赖关系
 - [packages] {Object} 以包名为键，包配置对象为值的键值对对象。有如下配置：
   - group {String} 表示包所属的组名
   - debug {Boolean} 包内的脚本请求是是否加 -min 后缀，默认和 require.config(“debug”) 相同
   - tag {String}, 最好为时间戳, 用于刷新客户端本包的模块文件缓存
   - filter {String} 文件名后缀
   - combine {Boolean}, 如果总和 combine 设置为 true，但是单个包 combine 设置为 false，则该包内文件不进行自动 combo
   - base {String}, 表示包所在的 url 路径, 相对路径表示相对于当前页面路径.
   - path 作用同 base 配置
   - charset {String}, 表示宝贝所有模块定义文件的编码格式, 默认 utf-8
- [modules] {Object} 以单个模块为键，单个模块配置对象为值的键值对对象。有如下配置：
   - requires {Array} 该模块的依赖模块名数组。当设置 combine 为 true 时需要配置，否则不建议配置.
   - alias {String|Array} 该模块的别名。为数组时，则会将数组中的模块合并返回
   - tag {String} 单个模块的时间戳。仅在 combine 为 false 时生效。 combine:true 时取对应包的 tag.

总配置范例概览：

	require.config({
		// 开启自动 combo 模式
		combine:true,
		// base 路径库内置模块的时间戳
		tag:'2014',
		// 整个类库的基准路径
		base:'http://x.com/a',
		packages:{
		 x:{
		     // x 包的基准路径
		     base:'http://x.com/biz/',
		     // x 包的时间戳
		     tag:'x',
		     // 加载的文件后面添加-debug。如 a.js -> a-debug.js
		     filter : 'debug'
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

packages包配置示例：

	require.config({
		packages:{
			// 包名
			"tc": {
				tag:"20141015", // 动态加载包内的模块js文件时,
				             // 自动加上 ?t=20141015, 用于文件更新
				base:"../", // 包的路径, 相对路径指相对于当前页面路径
				charset:"gbk" // 包里模块文件编码格式
			}
		}
	});

group组介绍示例1：

简单使用(如果想将多个包combo到一起，需要通过配置参数group来实现。例如，对于以下包进行combo：)

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

由于pkg-a和pkg-b的group设置为”group1”，则KISSY会对这两个包的模块进行combo。而pkg-c则单独combo。产生URL如下：

	http://example.com/??pkg-a/mod1.js,pkg-a/mod2.js,pkg-b/mod1.js,...?t=-389697156.js
	http://example.com/pkg-c/??mod1.js,...?t=20111111.js

其中，时间戳?t=-389697156.js是根据pkg-a和pkg-b的时间戳tag来计算的。如果修改了其中一个包的时间戳，则combo后的时间戳也会变化。

配置模块依赖示例：

预注册模块：由于浏览器端加载脚本都是异步，因此如果模块之间有依赖，主逻辑只能在加载 A 模块后才知道并加载 A 的依赖。因此加载过程为串行。为了降低串行的性能损耗，config()可以预先注册模块的依赖关系，一次性加载模块和与之关联的依赖，比如
	// 预注册模块依赖
	require.config({
		modules : {
			'mod-a':{
		        requires:['mod-b','mod-c']
		    },
		    'mod-b':{
		        requires:['mod-d','mod-e']
		    }
		}
	});

	// 引用模块时，在配置了 combine:true 后，将会合并载入模块及其依赖
	require(['mod-a', 'mod-b'], function(ModA,ModB){
	    // 沙箱逻辑
	});

配置模块别名示例：

	// 定义模块的别名
	require.config({
		modules : {
			'mod-a':{
		        alias:['mod-b/1.2'] // 数组长度为1
		    }
		}
	});

	// 正常使用模块
	require(['mod-a'],function(ModA){ });

### `require.config(name, value)`

设置或获取配置参数
- name {String} 参数名称. 取值范围参见上面函数
- value {Object} 参数值. 如果不设置则返回参数名称对应的参数值

### `modulex.getScript(url, config)`

动态加载目标地址的资源文件，返回创建的 link 节点或 script 节点

- url {String} js/css 的资源地址
- cofnig {Object} 配置对象
- charset {String} 资源文件的字符编码
- success {Function} 资源加载成功后回调函数
- error {Function} 超时或发生错误时回调函数. 当资源文件为 css 文件时不支持
- timeout {Number} 单位为秒, 默认无限大. 超时后触发 error 回调. 当资源文件为 css 文件是不支持