const { go } = require("./index")();

console.log("Before");
go( (x,y) => {
  console.log(`x = ${x}`);
  console.log(`y = ${y}`);
  return x + y;
},10,20
)
.then(
  (result) => console.log(result.value)
);
console.log("After");
