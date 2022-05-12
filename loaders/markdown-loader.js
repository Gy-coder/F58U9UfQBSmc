const marked = require("marked");

const transform = (code) => {
  const html = marked.parse(code);
  return `
    const str = ${JSON.stringify(html)}
    if(document){
        document.body.innerHTML = str
    }
    export default str;
  `;
};

module.exports = transform;
