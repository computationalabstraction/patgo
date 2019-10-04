const { go , stay , shutdown } = require("./src")();

console.log("Before");

(async _ => {
    let v = await go((x,y) => x + y,[10,20]);
    console.log("here");
    console.log(v);
})();

(async _ => {
    let frame = go(
        async (c) => {
            let msg = await c.receive();
            console.log(msg);
            c.send("Pong");
        }
    );

    frame.channel.send("Ping");

    let msg = await frame.channel.receive();
    
    console.log(msg);

    let add = stay(async (x,y,c) => { 
        console.log(await c.receive());
        c.send("Goodbye!");
        return x+y;
    });
    let p = add(10,20);
    p.channel.send("Hello");
    console.log(await p.channel.receive());
    console.log(await p);
    // add(50,60).then(v => {console.log("Second"); console.log(v)});
    // add(100,200).then(v => {console.log("Third"); console.log(v)});
})();

// frame.p.then((e) => console.log("Done"));
console.log("After");
shutdown();