class Queue
{
  constructor()
  {
      this.q = [];
  }

  enqueue(v)
  {
     this.q.push(v);
  }


  dequeue()
  {
    const first = this.q[0];
    this.q.slice(1);
    return first;
  }
}

modules.export = Queue;
