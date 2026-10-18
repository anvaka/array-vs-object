var Benchmark = require('benchmark');
var bodyCount = 1000;
var vectorSum, objectSum, arraySum, flatSum, typedSum;

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

function addObjects(a, b) {
  a.x += b.x;
  a.y += b.y;
  a.z += b.z;
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

// Same as addArrayFromChunk, but kept separate so that V8 sees only
// Float64Array here and doesn't have to handle two kinds of input.
function addArrayFromTypedChunk(out, input, index) {
  out[0] += input[index + 0]
  out[1] += input[index + 1]
  out[2] += input[index + 2]
}

function createVectors() {
  let vectors = [];
  for (let i = 0; i < bodyCount; ++i) {
    vectors.push(new Vector(i, i, i));
  }
  return vectors;
}

function createObjects() {
  let vectors = [];
  for (let i = 0; i < bodyCount; ++i) {
    vectors.push({x: i, y: i, z: i});
  }
  return vectors;
}

function createArrays() {
  let vectors = [];
  for (let i = 0; i < bodyCount; ++i) {
    vectors.push([i, i, i]);
  }
  return vectors;
}

function createFlatArray() {
  let vectors = [];
  for (let i = 0; i < bodyCount; ++i) {
    vectors.push(i, i, i);
  }
  return vectors;
}

function createTypedArray() {
  let vectors = new Float64Array(bodyCount * 3);
  for (let i = 0; i < bodyCount; ++i) {
    vectors[3 * i + 0] = i;
    vectors[3 * i + 1] = i;
    vectors[3 * i + 2] = i;
  }
  return vectors;
}

function sumVectors(vectors) {
  let sum = new Vector(0, 0, 0);
  for (let i = 0; i < bodyCount; ++i) {
    sum.add(vectors[i])
  }
  return sum;
}

function sumObjects(vectors) {
  let sum = {x: 0, y: 0, z: 0};
  for (let i = 0; i < bodyCount; ++i) {
    addObjects(sum, vectors[i]);
  }
  return sum;
}

function sumArrays(vectors) {
  let sum = [ 0, 0, 0 ];
  for (let i = 0; i < bodyCount; ++i) {
    addArrays(sum, vectors[i]);
  }
  return sum;
}

function sumFlatArray(vectors) {
  let sum = [ 0, 0, 0 ];
  for (let i = 0; i < bodyCount * 3; i += 3) {
    addArrayFromChunk(sum, vectors, i);
  }
  return sum;
}

function sumTypedArray(vectors) {
  let sum = [ 0, 0, 0 ];
  for (let i = 0; i < bodyCount * 3; i += 3) {
    addArrayFromTypedChunk(sum, vectors, i);
  }
  return sum;
}

function printResults() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
  console.log('Vector sum: ' + vectorSum.x, vectorSum.y, vectorSum.z);
  console.log('Object sum: ' + objectSum.x, objectSum.y, objectSum.z);
  console.log('Array sum: ' + arraySum[0], arraySum[1], arraySum[2]);
  console.log('Flat array sum: ' + flatSum[0], flatSum[1], flatSum[2]);
  console.log('Float64Array sum: ' + typedSum[0], typedSum[1], typedSum[2]);
  console.log('');
}

// Every run allocates 1,000 vectors and then sums them, so this mostly
// measures how fast each representation is created.
new Benchmark.Suite()
.add('Allocate and sum with new Vector(x, y, z)', function() {
  vectorSum = sumVectors(createVectors());
})
.add('Allocate and sum with {x, y, z}', function() {
  objectSum = sumObjects(createObjects());
})
.add('Allocate and sum with [x, y, z]', function() {
  arraySum = sumArrays(createArrays());
})
.add('Allocate and sum with flat array', function() {
  flatSum = sumFlatArray(createFlatArray());
})
.add('Allocate and sum with flat Float64Array', function() {
  typedSum = sumTypedArray(createTypedArray());
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', printResults)
.run();

// Vectors are allocated once, so this measures only reading them.
var vectors = createVectors();
var objects = createObjects();
var arrays = createArrays();
var flatArray = createFlatArray();
var typedArray = createTypedArray();

new Benchmark.Suite()
.add('Sum only with new Vector(x, y, z)', function() {
  vectorSum = sumVectors(vectors);
})
.add('Sum only with {x, y, z}', function() {
  objectSum = sumObjects(objects);
})
.add('Sum only with [x, y, z]', function() {
  arraySum = sumArrays(arrays);
})
.add('Sum only with flat array', function() {
  flatSum = sumFlatArray(flatArray);
})
.add('Sum only with flat Float64Array', function() {
  typedSum = sumTypedArray(typedArray);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', printResults)
.run();
