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

    shutdown() {
        for (let worker of this.workers) {
            worker.worker.unref();
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
        this.channel = new MessageChannel();
        this.channel.port1.send = send;
        this.channel.port1.receive = receive;
    }

    run(params) {
        let worker;
        let packet = {
            code: code(this.routine, params),
            channel: this.channel.port2
        };
        if (this.once) {
            worker = this.worker.worker;
            packet.context = JSON.stringify(this.context);
        }
        else worker = this.worker;
        let p = new Promise((resolve, reject) => {
            worker.postMessage(packet, [this.channel.port2]);
            worker.on('message',
                (output) => {
                    if (output instanceof Error) {
                        reject(output);
                    }
                    else {
                        resolve(output);
                    }
                    if (this.once) {
                        this.stop();
                    }
                }
            );
        });
        p.channel = this.channel.port1;
        return p;
    }

    stop() {
        this.channel.port1.unref();
        this.channel.port2.unref();
        if (this.once) {
            this.pool.surrender(this.worker);
        }
        else {
            this.worker.unref();
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
        this.stayers.push(wrapped);
        return (...params) => wrapped.run(params);
    }

    function shutdown() {
        default_pool.shutdown();
        stayers.forEach(r => r.stop());
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