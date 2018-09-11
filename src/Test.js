const { go , goR , stop , registry } = require(".")();

console.log("Before");

go((x,y) => x + y,[10,20]).then((v) => console.log(v));

let gr = goR(
    (c) => {
        c.on('message', message => {
            console.log(message);
            c.postMessage("Pong");
        });
        return true;
    }
);

gr.then((e) => console.log("Done",e));

gr.channel.on("message", message => {
    console.log(message);
    gr.routine.stop();
});

gr.channel.postMessage("Ping");

console.log("After");