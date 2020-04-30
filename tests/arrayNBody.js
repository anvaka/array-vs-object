function reset(arr) {
    arr[0] = 0;
    arr[1] = 0;
   arr[2] = 0;
}

function distanceTo(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function addScaledDifference(out, a, b, scale) {
  out[0] += (a[0] - b[0]) * scale;
  out[1] += (a[1] - b[1]) * scale;
  out[2] += (a[2] - b[2]) * scale;
}

function add(out, b) {
  out[0] += b[0];
  out[1] += b[1];
  out[2] += b[2];
}

function arr() {
  var a = [];
  a[0] = 0;
  a[1] = 0;
  a[2] = 0;
  return a;
}

class Body {
  constructor() {
    this.position = arr(); //[0, 0, 0]
    this.force = arr(); // [0, 0, 0]
    this.velocity = arr(); // [0, 0, 0]
  }

  reset() {
    reset(this.force);
  }

  applyForce(other) {
    let distance = distanceTo(this.position, other.position); 
    if (distance < 1e-5) {
      this.position[0] += 0.5
      return this.applyForce(other);
    }

    addScaledDifference(this.force, other.position, this.position, 1/(
      distance*distance*distance));
  }

  updatePosition() {
    let timeStep = 0.01;
    this.velocity[0] += timeStep * this.force[0];
    this.velocity[1] += timeStep * this.force[1];
    this.velocity[2] += timeStep * this.force[2];
    let v = Math.hypot(this.velocity[0], this.velocity[1], this.velocity[2]);

    if (v > 1) {
      this.velocity[0] /= v; this.velocity[1] /= v; this.velocity[2] /= v;
    }
    

    this.position[0] += 0.4 * this.velocity[0];
    this.position[1] += 0.4 * this.velocity[1];
    this.position[2] += 0.4 * this.velocity[2]
  }
}

function createSimulator(bodyCount) {
  let bodies = [];
  for (let i = 0; i < bodyCount; ++i) {
    let body = new Body();
    let a = (i / bodyCount) * 2 * Math.PI;
    body.position[0] = 15 * Math.cos(a);
    body.position[1] = 15 * Math.sin(a);
    body.position[2] = 15 * Math.sin(a);
    bodies.push(body)
  }

  return {
    updatedForces,
    bodies,
    getAverageLength
  }

  function getAverageLength() {
    let sum = [0, 0, 0]
    for (let j = 0; j < bodyCount; ++j) {
      let srcBody = bodies[j];
      add(sum, srcBody.position);
    }
    return Math.hypot(sum[0]/bodyCount, sum[1]/bodyCount, sum[2]/bodyCount);
  }
 
  function updatedForces() {
    for (let j = 0; j < bodyCount; ++j) {
      let srcBody = bodies[j];
      srcBody.reset();
      for (let k = 0; k < bodyCount; ++k) {
        if (k === j) continue;
        let otherBody = bodies[k]
        srcBody.applyForce(otherBody);
      }
    }
    for (let j = 0; j < bodyCount; ++j) {
      bodies[j].updatePosition();
    }
  }
}

module.exports = createSimulator;