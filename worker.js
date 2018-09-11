const { parentPort , workerData } = require('worker_threads');
let context = JSON.parse(workerData);
parentPort.on("message",async code => {
    eval(code);
    parentPort.postMessage(await routine());
});