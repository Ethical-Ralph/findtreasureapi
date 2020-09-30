class Queue {
  constructor() {
    this.queue = [];
  }
  allQueues() {
    return this.queue;
  }
  enQueue(func) {
    this.queue.push(func);
    return this.queue;
  }
  getNext() {
    return this.queue.shift();
  }
  length() {
    return this.queue.length;
  }
}
module.exports = Queue;
