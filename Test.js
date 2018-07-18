const { go } = require("./index")();

console.log("Before");

go( () => console.log("Executed Concurrently") ).then( () => console.log("Execution Complete") );

console.log("After");
