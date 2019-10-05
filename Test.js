const { go , stay , shutdown, increase_pool_size } = require("./src")();

console.log("Before");

let timebefore = new Date();
(async _ => {
    // let cAdd = stay();

    increase_pool_size(20);

    let arr = [];
    for(let i = 0;i < 1000;i++) 
    {
        arr.push(go(async (x,y) => x + y,[i,i*2]));
        // cAdd(i,i*2));
    }

    Promise.all(arr).then(v => console.log(v));

    // let r = cAdd(10,20);
    // r.channel.send("first")
    // .then( () => r.channel.receive())
    // .then( v => console.log("hello1 ",v))
    // .then( _ => r )
    // .then( v => console.log(v));
    // let r2 = cAdd(100,200);
    // r2.channel.send("second")
    // .then( () => r2.channel.receive())
    // .then( v => console.log("hello2 ",v))
    // .then( _ => r2 )
    // .then( v => console.log(v));
    // console.log(v);
    // console.log(await r);
    shutdown();
})().then( _ => {
    console.log( `${((new Date().getTime()/1000) - (timebefore.getTime()/1000))} seconds`);
});


// (async _ => {
//     let v = await go((x,y) => x + y,[10,20]);
//     console.log("here");
//     console.log(v);
// })();

// (async _ => {
    // let frame = go(
    //     async (c) => {
    //         let msg = await c.receive();
    //         console.log(msg);
    //         c.send("Pong");
    //     }
    // );

    // frame.channel.send("Ping");

    // let msg = await frame.channel.receive();
    
    // console.log(msg);

    // let add = stay(async (x,y,c) => { 
        // console.log(await c.receive());
        // c.send("Goodbye!");
    //     return x+y;
    // });
    // let p = add(10,20);
    // add(50,60).then(v => {console.log("Second"); console.log(v)});
    // add(100,200).then(v => {console.log("Third"); console.log(v)});
    // add(11,22).then(v => {console.log("Fourth"); console.log(v)});
    // p.channel.send("Hello")
    // .then(() => p.channel.receive())
    // .then(m => console.log(m))
    // .then(_ => p)
    // .then(val => console.log(val));
    // console.log(await );
    // console.log(await p);
//     shutdown();
// })();

// frame.p.then((e) => console.log("Done"));
// shutdown();
console.log("After");
