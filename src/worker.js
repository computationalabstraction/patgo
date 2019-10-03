const { parentPort , workerData } = require('worker_threads');

function send(data)
{
    return new Promise( (resolve,reject) => {
        try {
            this.postMessage(data);   
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

function receive()
{
    return new Promise( (resolve,reject) => {
        try {
            this.on('message', data => resolve(data));
        } catch (error) {
            reject(error);
        }
    });
}

let context = JSON.parse(workerData);
parentPort.on("message", async packet => {
    if(packet.context) {
        context = packet.context;
    }
    eval(packet.code);
    let data;
    try
    {
        packet.channel.send = send;
        packet.channel.receive = receive;
        data = await routine(packet.channel);
    }
    catch(err)
    {
        data = err;
    }
    parentPort.postMessage(data);
});