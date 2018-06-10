# Goj
### Goroutines in Javascript

Goj is a small wrapper around Napa.js to give Go Style Concurrency in Javascript.
This library/wrapper enables Developer to seamlessly do Concurrent Programming on Node.js,
it as simple as `go( () => ... )` and it will assign a Thread (Worker - Napajs) to execute the function.

Goj internally uses a Thread Pool (Zone - Napajs) by default it is 8 Threads (Worker - Napajs) but it can be changed.


## Installation
### `npm install goj`

## Example
```javascript
const { go } = require("goj")();

console.log("Before");

function f1(x,y) {
  console.log(`x = ${x}`);
  console.log(`y = ${y}`);
  return x + y;
}

for(let i = 0;i < 1000;i++)
{
  go(f1,i*10,i*10).then(result => console.log(result.value));
}

console.log("After");
```
