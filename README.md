# Array vs Object

When it comes to vector math in javascript it is usually done in a few ways. I was curious to
see if there is any difference in the performance of these methods. Particularly for the case
when array of vectors is required.

Let's consider possible options:

### Option 1: Vector class

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

### Option 2: Array of triplets

``` js
let v = [0, 1, 2]; // vector with three items
```

### Option 3: Pre-allocated array

``` js
let buffer = new Float64Array(1000);

let vIndex = 0;
buffer[vIndex + 0] = 0;
buffer[vIndex + 1] = 1;
buffer[vIndex + 2] = 2;
```


## The benchmark

Disclaimer: The benchmark has to be taken with grain of salt, as I'm not sure whether v8 optimizes it 
in any way under the hood.

With that disclaimer, [the benchmark](index.js) initializes `1,000` vectors with each approach,
and then finds the sum of all vectors:

``` js
for(let i = 0; i < 1000; ++i) {
  objectVectors.push(new Vector(i, i, i))
}

let sum = new Vector(0, 0, 0);
for (let i = 0; i < bodyCount; ++i) {
  sum.add(vectors[i])
}
vectorSum = sum;
```

This method is adjusted for each method described above, and then we just measure how many times
we are able to execute this operation per second.

## Results

``` 
> node --version
v12.4.0

> node index.js
Compute sum with Vector(x, y, z) x 71,146 ops/sec ±2.04% (79 runs sampled)
Compute sum with array[x, y, z] x 48,609 ops/sec ±2.45% (84 runs sampled)
Compute sum with huge chunk x 73,745 ops/sec ±1.49% (85 runs sampled)
Fastest is Compute sum with huge chunk
Vector sum: 499500 499500 499500
Array sum: 499500 499500 499500
Chunk sum: 499500 499500 499500
```

Like mentioned above, take these numbers with grain of salt. I did [n-body simulation tests](nbodyTest.js) with these approaches, and performance was almost identical:

```
> node nbodyTest.js 
Compute n-body with Vector(x, y, z) x 7.67 ops/sec ±2.08% (23 runs sampled)
Compute n-body with array[x, y, z] x 7.22 ops/sec ±2.05% (22 runs sampled)
Compute n-body with Float64Array(3) x 6.83 ops/sec ±3.81% (21 runs sampled)
Fastest is Compute n-body with Vector(x, y, z)
Object avg position length: 4.402166577294573e-15
Array avg position length: 4.402166577294573e-15
Float64Array avg position length: 4.402166577294573e-15
```

## Other benchmarks

* [Set vs Object](https://github.com/anvaka/set-vs-object) - what is faster: use object fields or Map/Set collections?
* [Iterator vs foreach](https://github.com/anvaka/iterator-vs-foreach) - what is faster:
use `forEach`, `for`, `for .. of`, `[Symbol.Iterator]()`, or `yield *`?


## Feedback

If you want to add other tests - please do so. Pull requests are very much welcomed!

## License

MIT
