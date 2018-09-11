const { Worker } = require('worker_threads');

const worker_code = "./worker.js";

class GoRoutine
{
    constructor(routine,context,once = true)
    {
        this.once = once;
        this.routine = routine;
        this.worker = new Worker(worker_code, {
            workerData: JSON.stringify(context),
        });
    }

    start(params)
    {
        let gen_code = code(this.routine,params);
        return new Promise((resolve, reject) => {
            this.worker.postMessage(gen_code);
            this.worker.on('message', 
                (v) => {
                    resolve(v);
                    if(this.once) this.worker.unref();
                }
            );
            this.worker.on('error', 
                (v) => {
                    reject(v);
                    if(this.once) this.worker.unref();
                }
            );
        });
    }

    stop()
    {
        this.worker.unref();
    }
}

function code(func,params)
{
    return `var routine = async _ => await (${func})(${params.join(",")});`;
}

module.exports = () => {

    let registry = {};

    function wrap(routine,context,once = true)
    {
        return new GoRoutine(routine,context,once);
    }

    function go(routine,params = [],context = {},once = true)
    {
        if(routine instanceof GoRoutine) 
        {
            return routine.start(params)
        }
        else 
        {
            const gr = wrap(routine,context,once);
            if(!gr.once) cache[routine.name] = gr;
            return gr.start(params);
        }
    }

    return {
        go,
        wrap,
        registry,
        GoRoutine
    };
}