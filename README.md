# Array vs Object

When it comes to vector math in javascript it is usually done in a few ways. I was curious to
see if there is any difference in the performance of these methods. Particularly for the case
when array of vectors is required.

Let's consider possible options:

### Option 1: Objects

A class:

``` js
class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  // ...
}
let v = new Vector(0, 1, 2);
```

or a plain object literal:

``` js
let v = {x: 0, y: 1, z: 2};
```

### Option 2: Array of triplets

``` js
let v = [0, 1, 2]; // vector with three items
```

### Option 3: One flat array

All vectors are stored one after another in a single array. It can be a regular array:

``` js
let buffer = [];
buffer.push(0, 1, 2); // first vector
buffer.push(3, 4, 5); // second vector
```

or a pre-allocated typed array:

``` js
let buffer = new Float64Array(1000 * 3);

let vIndex = 0;
buffer[vIndex + 0] = 0;
buffer[vIndex + 1] = 1;
buffer[vIndex + 2] = 2;
```


## The benchmark

Disclaimer: The benchmark has to be taken with grain of salt, as I'm not sure whether v8 optimizes it 
in any way under the hood.

With that disclaimer, [the benchmark](index.js) creates `1,000` vectors with each approach,
and then finds the sum of all vectors:

``` js
function createVectors() {
  let vectors = [];
  for (let i = 0; i < bodyCount; ++i) {
    vectors.push(new Vector(i, i, i));
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
```

This code is adjusted for each method described above, and then we measure how many times
per second we can run it. The benchmark runs in two modes:

* **Allocate and sum** creates the vectors on every run, so it mostly measures how fast each
representation can be created.
* **Sum only** creates the vectors once, and measures only how fast they can be read.

## Results

``` 
> node --version
v24.7.0

> node index.js
Allocate and sum with new Vector(x, y, z) x 256,190 ops/sec ±0.43% (95 runs sampled)
Allocate and sum with {x, y, z} x 254,748 ops/sec ±0.21% (101 runs sampled)
Allocate and sum with [x, y, z] x 172,645 ops/sec ±0.57% (97 runs sampled)
Allocate and sum with flat array x 187,656 ops/sec ±0.43% (97 runs sampled)
Allocate and sum with flat Float64Array x 301,892 ops/sec ±0.81% (95 runs sampled)
Fastest is Allocate and sum with flat Float64Array
Vector sum: 499500 499500 499500
Object sum: 499500 499500 499500
Array sum: 499500 499500 499500
Flat array sum: 499500 499500 499500
Float64Array sum: 499500 499500 499500

Sum only with new Vector(x, y, z) x 969,119 ops/sec ±0.18% (100 runs sampled)
Sum only with {x, y, z} x 969,905 ops/sec ±0.18% (100 runs sampled)
Sum only with [x, y, z] x 690,544 ops/sec ±1.96% (97 runs sampled)
Sum only with flat array x 788,125 ops/sec ±1.89% (98 runs sampled)
Sum only with flat Float64Array x 792,882 ops/sec ±6.11% (88 runs sampled)
Fastest is Sum only with {x, y, z},Sum only with new Vector(x, y, z)
Vector sum: 499500 499500 499500
Object sum: 499500 499500 499500
Array sum: 499500 499500 499500
Flat array sum: 499500 499500 499500
Float64Array sum: 499500 499500 499500
```

Creating the vectors takes most of the time in the first mode, and that's where a pre-allocated
`Float64Array` wins: it is a single allocation, while other approaches need an object per vector
or an array that keeps growing. When vectors are only read, objects are the fastest in this loop.

A class instance and a `{x, y, z}` literal perform the same: v8 gives objects with the same
fields in the same order the same internal shape, no matter how they were created.

## N-body simulation

Summing vectors is a very simple loop, so I also did [n-body simulation tests](nbodyTest.js)
with these approaches:

* `new Vector(x, y, z)` - each body has `position`, `velocity` and `force` vectors ([source](tests/objectNBody.js))
* `{x, y, z}` - same, but every vector is a plain object literal ([source](tests/literalNBody.js))
* `[x, y, z]` - same, but every vector is a regular array ([source](tests/arrayNBody.js))
* `Float64Array(3)` - same, but every vector is a small typed array ([source](tests/nativeArray.js))
* flat array - all bodies share three flat regular arrays ([source](tests/flatArrayNBody.js))
* flat `Float64Array` - same, but the flat buffers are typed arrays ([source](tests/flatFloat64ArrayNBody.js))

An earlier version of these tests computed the distance between bodies with `Math.hypot()`, and
all approaches had exactly the same performance. Turns out most of the time was spent inside
`Math.hypot()`, which hid other differences. The tests now use `Math.sqrt(dx * dx + dy * dy + dz * dz)`,
and the `Math.hypot()` version is [kept](tests/objectNBodyHypot.js) for comparison:

```
> node nbodyTest.js 
Compute n-body with new Vector(x, y, z) and Math.hypot() x 76.22 ops/sec ±0.59% (79 runs sampled)
Compute n-body with new Vector(x, y, z) x 279 ops/sec ±0.56% (91 runs sampled)
Compute n-body with {x, y, z} x 283 ops/sec ±0.63% (87 runs sampled)
Compute n-body with [x, y, z] x 300 ops/sec ±0.56% (92 runs sampled)
Compute n-body with Float64Array(3) x 215 ops/sec ±0.43% (87 runs sampled)
Compute n-body with flat array x 281 ops/sec ±0.52% (91 runs sampled)
Compute n-body with flat Float64Array x 282 ops/sec ±0.55% (92 runs sampled)
Fastest is Compute n-body with [x, y, z]
Vector + Math.hypot() avg position length: 18.227050673264817
Vector avg position length: 18.227050673264817
Object literal avg position length: 18.227050673264817
Array avg position length: 18.227050673264817
Float64Array avg position length: 18.227050673264817
Flat array avg position length: 18.227050673264817
Flat Float64Array avg position length: 18.227050673264817
```

Replacing `Math.hypot()` with `Math.sqrt()` makes the simulation ~3.6 times faster, which is a much
bigger difference than the choice of vector representation. Arrays, objects (class or literal) and
flat buffers (regular or `Float64Array`) are within ~10% of each other. Giving each vector its own small `Float64Array(3)`
is the slowest option.

Keep in mind that positions of `1,000` bodies take only `24KB` and fit into CPU cache. Memory
layout may matter more for bigger data.

## Other benchmarks

* [Set vs Object](https://github.com/anvaka/set-vs-object) - what is faster: use object fields or Map/Set collections?
* [Iterator vs foreach](https://github.com/anvaka/iterator-vs-foreach) - what is faster:
use `forEach`, `for`, `for .. of`, `[Symbol.Iterator]()`, or `yield *`?


## Feedback

If you want to add other tests - please do so. Pull requests are very much welcomed!

## License

MIT
