const { go } = require("./index")();

console.log("Before");
go(() => console.log("Hello from JRoutines")).then(() => console.log("Execution Complete"))
console.log("After");
