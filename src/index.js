// const napa = require("./napa.backend");
const node = require("./node.backend");

module.exports = (backend = "node" , size = 8) =>
{ 
  // if(backend == "napa") return napa(size);
  if(backend == "node") return node();
};