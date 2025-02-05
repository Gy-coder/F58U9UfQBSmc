var depRelation = [{
      key: "index.js", 
      deps: ["a.js","b.js","markdown.md"],
      code: function(require, module, exports){
        "use strict";

var _a = _interopRequireDefault(require("./a.js"));

var _b = _interopRequireDefault(require("./b.js"));

var _markdown = _interopRequireDefault(require("./markdown.md"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_a["default"].getB());
console.log(_b["default"].getA());
console.log(_markdown["default"]);
      }
    },{
      key: "a.js", 
      deps: ["b.js"],
      code: function(require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _b = _interopRequireDefault(require("./b.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a = {
  value: 'a',
  getB: function getB() {
    return _b["default"].value + ' from a.js';
  }
};
var _default = a;
exports["default"] = _default;
      }
    },{
      key: "b.js", 
      deps: ["a.js"],
      code: function(require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _a = _interopRequireDefault(require("./a.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var b = {
  value: 'b',
  getA: function getA() {
    return _a["default"].value + ' from b.js';
  }
};
var _default = b;
exports["default"] = _default;
      }
    },{
      key: "markdown.md", 
      deps: [],
      code: function(require, module, exports){
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var str = "<h1 id=\"i-am-h1\">I am h1</h1>\n<h2 id=\"i-am-h2\">I am h2</h2>\n<ul>\n<li><p>鼓励</p>\n</li>\n<li><p>鼓励</p>\n</li>\n<li><p>鼓励</p>\n</li>\n</ul>\n<p><strong>黑的</strong></p>\n";

if (document) {
  document.body.innerHTML = str;
}

var _default = str;
exports["default"] = _default;
      }
    }];
var modules = {};
execute(depRelation[0].key)

  function execute(key) {
    if (modules[key]) { return modules[key] }
    var item = depRelation.find(i => i.key === key)
    if (!item) { throw new Error(`${item} is not found`) }
    var pathToKey = (path) => {
      var dirname = key.substring(0, key.lastIndexOf('/') + 1)
      var projectPath = (dirname + path).replace(/\.\//g, '').replace(/\/\//, '/')
      return projectPath
    }
    var require = (path) => {
      return execute(pathToKey(path))
    }
    modules[key] = { __esModule: true }
    var module = { exports: modules[key] }
    item.code(require, module, module.exports)
    return modules[key]
  }
  