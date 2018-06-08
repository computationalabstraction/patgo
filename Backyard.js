// class SQ
// {
//   constructor(name = uuidv4(), threads = 8, capacity = Infinity)
//   {
//     this.name = name;
//     this.zone = napa.zone.create(name, { workers: threads });
//     this.queue = new Queue();
//   }
//
//   enqueue(task)
//   {
//     return this.zone.execute(task);
//   }
// }
//
//
//
// let myq1 = new SQ();
//
//
// console.log(myq1);
//
//
// console.log("Before");
//
// myq1.enqueue( () => console.log("Hello World!") );
//
//
// console.log("After");

// Broadcast code to all 4 workers in 'zone1'.
// zone1.broadcast('console.log("hello world");');
//
// // Execute an anonymous function in any worker thread in 'zone1'.
// zone1.execute(
//     (text) =>"YO" + text,
//     ['hello napa'])
//     .then((result) => {
//         console.log("Here" + result.value);
//     });
//
