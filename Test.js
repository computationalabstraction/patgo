const { go } = require("./index")();

console.log("Before");

async function testing()
{
    let val = await go(
        (...val) => val.reduce((acc,v) => acc + v,0),
        [10,20,30,40,50]
    );
    console.log("Execution Complete Value = " + val);
}

testing();

console.log("After");
