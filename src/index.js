const { Worker, MessageChannel } = require('worker_threads');
const ee = require("conciseee");
const CORES = require('os').cpus().length;
const worker_code = "./src/worker.js";

function send(data) {
    return new Promise((resolve, reject) => {
        try {
            this.postMessage(data);
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

function receive() {
    return new Promise((resolve, reject) => {
        try {
            this.once('message', data => resolve(data));
        } catch (error) {
            reject(error);
        }
    });
}

class Pool {
    constructor(capacity) {
        this.nw = capacity;
        this.aw = 0;
        this.workers = [];
        this.add(this.aw);
    }

    add(n = 1) {
        console.log("Adding Worker");
        for (let i = 0; i < n; i++) {
            let thunk =
            {
                worker: new Worker(worker_code, { workerData: "{}" }),
                line: 0
            };
            this.workers.push(thunk);
        }
        this.aw += n;
    }

    surrender(worker) {
        worker.line--;
    }

    acquire() {
        if (this.aw < this.nw) {
            this.add();
            let worker = this.workers[this.workers.length - 1];
            worker.line++;
            return worker;
        }
        else {
            let smallest = this.workers[0];
            for (let i = 1; i < this.workers.length; i++) {
                if (smallest.line > this.workers[i].line) {
                    smallest = this.workers[i];
                }
            }
            smallest.line++;
            console.log(smallest.line);
            return smallest;
        }
    }

    shutdown(gracefully = true) {
        console.log("Pool Shutdown");
        for (let worker of this.workers) {
            console.log("PoolWorker Thread ID");
            console.log(worker.worker.threadId);
            if (gracefully) worker.worker.unref();
            else worker.worker.terminate();
        }
    }
}

class GoRoutine {
    constructor(routine, context, once = true, pool) {
        this.once = once;
        this.routine = routine;
        if (this.once) {
            this.pool = pool;
            this.context = context;
            this.worker = pool.acquire();
        }
        else {
            this.worker = new Worker(worker_code, {
                workerData: JSON.stringify(context)
            });
        }
    }

    run(params) {
        let worker;
        let channel = new MessageChannel();
        let packet = {
            code: code(this.routine, params),
            channel: channel.port2,
        };
        this.once? 
            (worker = this.worker.worker) || 
            (packet.context = JSON.stringify(this.context)) : 
            worker = this.worker;
        let p = new Promise((resolve, reject) => {
            worker.postMessage(packet, [channel.port2]);
            channel.port1.on('message',
                (output) => {
                    if (typeof (output) == "object" && output._return) {
                        if (typeof (output) == "object" && output.value._error) {
                            reject(output);
                        }
                        else resolve(output.value);
                        if(this.once) this.stop();
                    }
                }
            );
        });
        channel.port1.send = send;
        channel.port1.receive = receive;
        p.channel = channel.port1;
        return p;
    }

    stop(gracefully = true) {
        // console.log("GoRoutine Shutdown");
        if (this.once) {
            // this.channel.port1.unref();
            // this.channel.port2.unref();
            this.pool.surrender(this.worker);
        }
        else {
            // console.log("Stay Thread ID");
            // console.log(this.worker.threadId);
            // console.log(gracefully);
            if (gracefully) this.worker.unref();
            else this.worker.terminate();
        }
    }
}

function code(func, params) {
    params.push("channel");
    return `var routine = async channel => await (${func})(${params.join(",")});`;
}

module.exports = (size = CORES) => {

    console.log("cores: " + CORES);

    const realm = ee();
    const default_pool = new Pool(size);
    const stayers = [];

    function wrap(routine, context, once = true, pool = default_pool) {
        return new GoRoutine(routine, context, once, pool);
    }

    function go(routine, params = [], context = {}) {
        return wrap(routine, context, true).run(params);
    }

    function stay(routine, context = {}) {
        let wrapped = wrap(routine, context, false);
        stayers.push(wrapped);
        return (...params) => wrapped.run(params);
    }

    function increase_pool_size(n) 
    {
        default_pool.add(n);
    }

    function shutdown(gracefully = true) {
        // console.log("Global Shutdown");
        default_pool.shutdown(gracefully);
        // console.log("Stayers");
        // console.log(stayers);
        stayers.forEach(r => r.stop(gracefully));
    }

    return {
        go,
        stay,
        wrap,
        GoRoutine,
        Pool,
        default_pool,
        shutdown,
        realm,
        increase_pool_size
    };
};