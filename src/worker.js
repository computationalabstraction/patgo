const { parentPort , workerData } = require('worker_threads');
let context = JSON.parse(workerData);
parentPort.on("message", async packet => {
    eval(packet.code);
    let data;
    try
    {
        data = await routine(packet.channel);
    }
    catch(e)
    {
        data = e;
    }
    parentPort.postMessage(data);
});