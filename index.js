var Benchmark = require('benchmark');
var bodyCount = 1000;
var suite = new Benchmark.Suite;
var vectorSum, arraySum, chunkSum;

class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }
}

function addArrays(a, b) {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
}

function addArrayFromChunk(out, input, index) {
  out[0] += input[index + 0]
  out[1] += input[index + 1]
  out[2] += input[index + 2]
}

suite.add('Compute sum with Vector(x, y, z)', function() {
  let vectors = [];

  for (let i = 0; i < bodyCount; ++i) {
    vectors.push(new Vector(i, i, i));
  }

  let sum = new Vector(0, 0, 0);
  for (let i = 0; i < bodyCount; ++i) {
    sum.add(vectors[i])
  }
  vectorSum = sum;
})
.add('Compute sum with array[x, y, z]', function() {
  let vectors = [];

  for (let i = 0; i < bodyCount; ++i) {
    vectors.push([i, i, i]);
  }

  let sum = [ 0, 0, 0 ];
  for (let i = 0; i < bodyCount; ++i) {
    addArrays(sum, vectors[i]);
  }
  arraySum = sum;
})
.add('Compute sum with huge chunk', function() {
  let vectors = [];

  for (let i = 0; i < bodyCount; ++i) {
    vectors.push(i, i, i);
  }

  let sum = [ 0, 0, 0 ];
  for (let i = 0; i < bodyCount * 3; i += 3) {
    addArrayFromChunk(sum, vectors, i);
  }
  chunkSum = sum;
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
  console.log('Vector sum: ' + vectorSum.x, vectorSum.y, vectorSum.z);
  console.log('Array sum: ' + arraySum[0], arraySum[1], arraySum[2]);
  console.log('Chunk sum: ' + chunkSum[0], chunkSum[1], chunkSum[2]);
})
.run({ 'async': true });

