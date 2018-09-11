# patGo
### Goroutines in Javascript

patgo is a library which provides Go Style Concurrency in Javascript with swappable Node.js(Workers)/Napa.js backends.
This library enables Developer to seamlessly do Concurrent Programming on Node.js,
it as simple as `go( () => ... )` and it will assign a Thread (Worker) to execute the function.

`go( () => ... )` returns a Promise by default if the execution of the function(Goroutine) successful then Success Handler will be called and if your function returns some value you will get it as a Parameter in Success Handler.

Currently the function when executed will be isolated and closure will not be acessible.
It is recommended that you only do CPU Intensive tasks in the function(Goroutine).

## Examples
### 1. Simple
```javascript
const { go } = require("patgo")();

console.log("Before");

go( () => console.log("Executed Concurrently") ).then( () => console.log("Execution Complete") );

console.log("After");
```

### 2. Function Execution with Params
```javascript
const { go } = require("patgo")();

console.log("Before");

function f1(x,y) {
  console.log(`x = ${x}`);
  console.log(`y = ${y}`);
  return x + y;
}

for(let i = 0;i < 1000;i++)
{
  // You can pass an array n-params after the function and will be passed to the function when executed
  go(f1,[i*10,i*10]).then(result => console.log(result.value));
}

console.log("After");
```

### 3. Custom Thread Pool Size
```javascript
const { go } = require("patgo")(32);

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
