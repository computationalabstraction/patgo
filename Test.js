const { go , Channel } = require("./index")(16);
const EventEmitter = require('events');

console.log("Before");

function f1(obj) {
  console.log(`x = ${obj.x}`);
  console.log(`y = ${obj.y}`);
  return obj.x + obj.y;
}

// Closures dont work! with Napa.js
go(f1, { x: 10, y:10 , c: new EventEmitter() }).then(result => console.log(result.value));

// for(let i = 0;i < 1000;i++)
// {
//   go(f1,i*10,i*10).then(result => console.log(result.value));
// }

console.log("After");
