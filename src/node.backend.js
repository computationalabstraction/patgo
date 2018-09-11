const { Worker , MessageChannel } = require('worker_threads');

const worker_code = "./worker.js";

class GoRoutine
{
    constructor(routine,context,once = true)
    {
        this.once = once;
        this.routine = routine;
        this.worker = new Worker(worker_code, {
            workerData: JSON.stringify(context)
        });
        this.channel = new MessageChannel();
    }

    start(params)
    {
        let gen_code = code(this.routine,params);
        let p = new Promise((resolve, reject) => {
            let packet = { code:gen_code , channel:this.channel.port2 }
            this.worker.postMessage(packet,[this.channel.port2]);
            this.worker.on('message', 
                (v) => {
                    resolve(v);
                    if(this.once) {
                        this.stop();
                    }
                }
            );
            this.worker.on('error', 
                (v) => {
                    reject(v);
                    if(this.once) {
                        this.stop();
                    }
                }
            );
        });
        p.channel = this.channel.port1;
        p.routine = this;
        return p;
    }

    stop()
    {
        this.worker.unref();
        this.channel.port1.unref();
        this.channel.port2.unref();
    }
}

function code(func,params)
{
    params.push("channel");
    return `var routine = async channel => await (${func})(${params.join(",")});`;
}

module.exports = () => {

    let list = [];

    function wrap(routine,context,once = true)
    {
        return new GoRoutine(routine,context,once);
    }

    function cgo(routine , params , context , decide)
    {
        if(routine instanceof GoRoutine) 
        {
            list.push(routine);
            return routine.start(params)
        }
        else 
        {
            const gr = wrap(routine,context,decide);
            list.push(gr);
            return gr.start(params);
        }
    }

    function go(routine , params = [] , context = {})
    {
        return cgo(routine,params,context,true);
    }

    function gop(routine , params = [] , context = {})
    {
        return cgo(routine,params,context,false);
    }

    function stop()
    {
        for(let gr of registry) gr.stop();
    }

    return {
        go,
        gop,
        wrap,
        stop,
        list,
        GoRoutine
    };
};