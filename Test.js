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

    let add = stay((x,y) => x+y);
    add(10,20).then(v => {console.log("First"); console.log(v)});
    add(50,60).then(v => {console.log("Second"); console.log(v)});
    add(100,200).then(v => {console.log("Second"); console.log(v)});
})();

// frame.p.then((e) => console.log("Done"));
console.log("After");
shutdown();
