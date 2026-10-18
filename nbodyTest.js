var Benchmark = require('benchmark');
var createObjectHypotSim = require('./tests/objectNBodyHypot');
var createObject = require('./tests/objectNBody');
var createLiteralSim = require('./tests/literalNBody');
var createArraySim = require('./tests/arrayNBody');
var createNativeArraySim = require('./tests/nativeArray')
var createFlatArraySim = require('./tests/flatArrayNBody');
var createFlatFloat64ArraySim = require('./tests/flatFloat64ArrayNBody');
var bodyCount = 1000;
var iterationCount = 1;
var suite = new Benchmark.Suite;
var objectHypotAvg, objectAvg, literalAvg, arrayAvg, nativeArrayAvg, flatArrayAvg, flatFloat64ArrayAvg;

suite.add('Compute n-body with new Vector(x, y, z) and Math.hypot()', function() {
  let sim = createObjectHypotSim(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  objectHypotAvg = sim.getAverageLength();
})
.add('Compute n-body with new Vector(x, y, z)', function() {
  let sim = createObject(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  objectAvg = sim.getAverageLength();
})
.add('Compute n-body with {x, y, z}', function() {
  let sim = createLiteralSim(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  literalAvg = sim.getAverageLength();
})
.add('Compute n-body with [x, y, z]', function() {
  let sim = createArraySim(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  arrayAvg = sim.getAverageLength();
})
.add('Compute n-body with Float64Array(3)', function() {
  let sim = createNativeArraySim(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  nativeArrayAvg = sim.getAverageLength();
})
.add('Compute n-body with flat array', function() {
  let sim = createFlatArraySim(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  flatArrayAvg = sim.getAverageLength();
})
.add('Compute n-body with flat Float64Array', function() {
  let sim = createFlatFloat64ArraySim(bodyCount)
  for (let i = 0; i < iterationCount; ++i) {
    sim.updatedForces();
  }
  flatFloat64ArrayAvg = sim.getAverageLength();
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
  console.log('Vector + Math.hypot() avg position length: ' + objectHypotAvg);
  console.log('Vector avg position length: ' + objectAvg);
  console.log('Object literal avg position length: ' + literalAvg);
  console.log('Array avg position length: ' + arrayAvg);
  console.log('Float64Array avg position length: ' + nativeArrayAvg);
  console.log('Flat array avg position length: ' + flatArrayAvg);
  console.log('Flat Float64Array avg position length: ' + flatFloat64ArrayAvg);
})
.run({ 'async': true });
