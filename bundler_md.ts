// 请确保你的 Node 版本大于等于 14
// 请先运行 yarn 或 npm i 来安装依赖
// 然后使用 node -r ts-node/register 文件路径 来运行，
// 如果需要调试，可以加一个选项 --inspect-brk，再打开 Chrome 开发者工具，点击 Node 图标即可调试
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { writeFileSync, readFileSync } from "fs";
import { resolve, relative, dirname, join } from "path";
import * as babel from "@babel/core";
import { mkdir } from "shelljs";

// 设置根目录
const projectName = "project_md";
const projectRoot = resolve(__dirname, projectName);
// 类型声明
type DepRelation = { key: string; deps: string[]; code: string }[];
// 初始化一个空的 depRelation，用于收集依赖
const depRelation: DepRelation = []; // 数组！

// 将入口文件的绝对路径传入函数，如 D:\demo\fixture_1\index.js
collectCodeAndDeps(resolve(projectRoot, "index.js"));

// 先创建 dist 目录
const dir = `./${projectName}/dist`;
mkdir("-p", dir);
// 再创建 bundle 文件
writeFileSync(join(dir, "bundle.js"), generateCode());
console.log("done");

function generateCode() {
  let code = "";
  code +=
    "var depRelation = [" +
    depRelation
      .map((item) => {
        const { key, deps, code } = item;
        return `{
      key: ${JSON.stringify(key)}, 
      deps: ${JSON.stringify(deps)},
      code: function(require, module, exports){
        ${code}
      }
    }`;
      })
      .join(",") +
    "];\n";
  code += "var modules = {};\n";
  code += `execute(depRelation[0].key)\n`;
  code += `
  function execute(key) {
    if (modules[key]) { return modules[key] }
    var item = depRelation.find(i => i.key === key)
    if (!item) { throw new Error(\`\${item} is not found\`) }
    var pathToKey = (path) => {
      var dirname = key.substring(0, key.lastIndexOf('/') + 1)
      var projectPath = (dirname + path).replace(\/\\.\\\/\/g, '').replace(\/\\\/\\\/\/, '/')
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
  `;
  return code;
}

function collectCodeAndDeps(filepath: string) {
  const key = getProjectPath(filepath); // 文件的项目路径，如 index.js
  if (depRelation.find((i) => i.key === key)) {
    // 注意，重复依赖不一定是循环依赖
    return;
  }
  // 获取文件内容，将内容放至 depRelation
  let code = readFileSync(filepath).toString();
  if (/\.md$/.test(filepath)) {
    code = require("./loaders/markdown-loader.js")(code);
  }
  if (/\.css$/.test(filepath)) {
    // 如何文件路径以 .css 结尾
    code = `
      const str = ${JSON.stringify(code)}
      if(document){
        const style = document.createElement('style')
        style.innerHTML = str
        document.head.appendChild(style)
      }
      export default str
    `;
  }
  const { code: es5Code } = babel.transform(code, {
    presets: ["@babel/preset-env"],
  });
  // 初始化 depRelation[key]
  const item = { key, deps: [], code: es5Code };
  depRelation.push(item);
  // 将代码转为 AST
  const ast = parse(code, { sourceType: "module" });
  // 分析文件依赖，将内容放至 depRelation
  traverse(ast, {
    enter: (path) => {
      if (path.node.type === "ImportDeclaration") {
        // path.node.source.value 往往是一个相对路径，如 ./a.js，需要先把它转为一个绝对路径
        const depAbsolutePath = resolve(
          dirname(filepath),
          path.node.source.value
        );
        // 然后转为项目路径
        const depProjectPath = getProjectPath(depAbsolutePath);
        // 把依赖写进 depRelation
        item.deps.push(depProjectPath);
        collectCodeAndDeps(depAbsolutePath);
      }
    },
  });
}
// 获取文件相对于根目录的相对路径
function getProjectPath(path: string) {
  return relative(projectRoot, path).replace(/\\/g, "/");
}
