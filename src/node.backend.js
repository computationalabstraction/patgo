const { Worker , MessageChannel } = require('worker_threads');

const worker_code = "./worker.js";


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
            this.on('message', data => {
                resolve(data);
            });
        } catch (error) {
            reject(error);
        }
    });
}

const FREE = Symbol("FREE");
const RUNNING = Symbol("RUNNING");
const WAIT = Symbol("WAIT");
const CORES = require('os').cpus().length;

class Pool
{
    constructor(initial_capacity)
    {
        this.q = [];
        if(initial_capacity) this.nw = initial_capacity;
        else this.nw = CORES;
        this.wokers = [];
        for(let i = 0; i < this.nw; i++)
        {
            this.addWorker();
        }
    }

    addWorker()
    {
        let thunk = 
        {
            worker: new Worker(worker_code, {
                workerData: JSON.stringify(context)
            }),
            state: FREE
        }
        workers.push(thunk);
    }

    surrender(worker)
    {
        worker.state = FREE;
    }

    *get()
    {
        while(true)
        {
            let w = this.workers.filter(t => t.state == FREE);
            if(w) yield w;
            else 
            {
                this.addWorker();
                yield this.wokers[this.wokers.length-1];
            }
        }
    }
}

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
        this.channel.port1.send = send;
        this.channel.port1.receive = receive;
    }

    run(params)
    {
        let gen_code = code(this.routine,params);
        let p = new Promise((resolve, reject) => {
            let packet = { code:gen_code , channel:this.channel.port2 }
            this.worker.postMessage(packet,[this.channel.port2]);
            this.worker.on('message', 
                (output) => {
                    if(output instanceof Error)
                    {
                        reject(output);
                    }
                    else
                    {
                        resolve(output);
                    }
                    if(this.once) 
                    {
                        this.stop();
                    }
                }
            );
        });
        p.channel = this.channel.port1;
        p.routine = this;
        return { p:p , channel:this.channel.port1 , routine:this };
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
            return routine.run(params)
        }
        else 
        {
            const gr = wrap(routine,context,decide);
            list.push(gr);
            return gr.run(params);
        }
    }

    function go(routine , params = [] , context = {})
    {
        return cgo(routine,params,context,true);
    }

    function gostay(routine , params = [] , context = {})
    {
        return cgo(routine,params,context,false);
    }

    function stop()
    {
        for(let gr of registry) gr.stop();
    }

    return {
        go,
        gostay,
        wrap,
        stop,
        list,
        GoRoutine
    };
};