const { gop , stop , registry } = require(".")();

console.log("Before");

let gr = gop(
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