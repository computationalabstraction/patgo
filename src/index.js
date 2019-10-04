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
            this.on('message', data => {
                resolve(data);
            });
        } catch (error) {
            reject(error);
        }
    });
}

class Pool {
    constructor(capacity) {
        this.nw = capacity;
        this.nwc = 0;
        this.workers = [];
        this.add(this.nwc);
    }

    add(n = 1) {
        for (let i = 0; i < n; i++) {
            let thunk =
            {
                worker: new Worker(worker_code, { workerData: "{}" }),
                line: 0
            };
            this.workers.push(thunk);
        }
        this.nwc += n;
    }

    surrender(worker) {
        worker.line--;
    }

    acquire() {
        if (this.nwc < this.nw) {
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
            return smallest;
        }
    }

    shutdown(gracefully = true) {
        console.log("Pool Shutdown");
        for (let worker of this.workers) {
            console.log("PoolWorker Thread ID");
            console.log(worker.worker.threadId);
            if(gracefully) worker.worker.unref();
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
            this.channel = new MessageChannel();
            this.channel.port1.send = send;
            this.channel.port1.receive = receive;
        }
        else {
            this.worker = new Worker(worker_code, {
                workerData: JSON.stringify(context)
            });
            this.prev = null;
        }
    }

    run(params) {
        if(this.once) 
        {
            let packet = {
                code: code(this.routine, params),
                channel: this.channel.port2,
                context: JSON.stringify(this.context)
            };
            let p = new Promise((resolve, reject) => {
                this.worker.worker.postMessage(packet, [this.channel.port2]);
                this.worker.worker.on('message',
                    (output) => {
                        if (typeof(output) == "object" && output.error) {
                            reject(output);
                        }
                        else {
                            resolve(output);
                        }
                        this.stop();
                    }
                );
            });
            p.channel = this.channel.port1;
            return p;
        }
        else 
        {
            let channel = new MessageChannel();
            channel.port1.unref();
            channel.port2.unref();
            channel.port1.send = send;
            channel.port1.receive = receive;
            let packet = {
                code: code(this.routine, params),
                channel: channel.port2,
            };
            let eventualPromise = () => {
                return new Promise((resolve, reject) => {
                    this.worker.postMessage(packet, [channel.port2]);
                    this.worker.on('message',
                        (output) => {
                            if (typeof(output) == "object" && output.error) {
                                reject(output);
                            }
                            else {
                                resolve(output);
                            }
                        }
                    );
                });
            } 
            if(this.prev) this.prev = this.prev.then(eventualPromise);
            else this.prev = eventualPromise();
            this.prev.channel = channel.port1;
            return this.prev;
        }

    }

    stop(gracefully = true) {
        console.log("GoRoutine Shutdown");
        if (this.once) {
            this.channel.port1.unref();
            this.channel.port2.unref();
            this.pool.surrender(this.worker);
        }
        else {
            console.log("Stay Thread ID");
            console.log(this.worker.threadId);
            if(gracefully) this.worker.unref();
            else this.worker.terminate();
        }
    }
}

function code(func, params) {
    params.push("channel");
    return `var routine = async channel => await (${func})(${params.join(",")});`;
}

module.exports = (size = CORES) => {

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

    function shutdown(gracefully = true) {
        console.log("Global Shutdown");
        default_pool.shutdown(gracefully);
        console.log("Stayers");
        console.log(stayers);
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
        realm
    };
};