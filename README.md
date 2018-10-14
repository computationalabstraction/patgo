### <img src="./patgo.png" />
### Goroutines in Javascript

patgo is a library which provides **Go Style Concurrency** in Javascript using Node.js Workers
This library enables Developer to seamlessly do **Concurrent Programming** on Node.js,
it as simple as `go( () => ... )` and it will assign a Thread to execute the function. In addition to this patgo also provides the abstraction **Async Channels** from Go which are internally implemented using Message Port API.

## Hello World Example
```javascript
(async _ => {

    let { channel } = go(
        async (c) => {
            let msg = await c.receive();
            console.log(msg);
            c.send("Pong");
        }
    );

    channel.send("Ping");

    let msg = await channel.receive();
    
    console.log(msg);
    
})();
```
