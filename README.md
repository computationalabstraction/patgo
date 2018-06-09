# Goj
### Goroutines in Javascript

Go.js is a small wrapper around Napa.js to give Go Style Concurrency in Javascript

### To install `npm install goj`

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
