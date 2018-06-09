const { go } = require("./index")();

/* TODO: Adding Channels from GO */


console.log("Before");
go( () => console.log("Hello from JRoutines") ).then(() => console.log("Execution Complete"))
console.log("After");
