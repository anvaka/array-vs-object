// Same as arrayNBody.js, but every vector is a plain {x, y, z} object.

function reset(v) {
  v.x = 0;
  v.y = 0;
  v.z = 0;
}

function distanceTo(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function addScaledDifference(out, a, b, scale) {
  out.x += (a.x - b.x) * scale;
  out.y += (a.y - b.y) * scale;
  out.z += (a.z - b.z) * scale;
}

class Body {
  constructor() {
    this.position = {x: 0, y: 0, z: 0};
    this.force = {x: 0, y: 0, z: 0};
    this.velocity = {x: 0, y: 0, z: 0};
  }

  reset() {
    reset(this.force);
  }

  applyForce(other) {
    let distance = distanceTo(this.position, other.position); 
    if (distance < 1e-5) {
      this.position.x += 0.5
      return this.applyForce(other);
    }

    addScaledDifference(this.force, other.position, this.position, 1/(
      distance*distance*distance));
  }

  updatePosition() {
    let timeStep = 0.01;
    this.velocity.x += timeStep * this.force.x;
    this.velocity.y += timeStep * this.force.y;
    this.velocity.z += timeStep * this.force.z;
    let v = Math.hypot(this.velocity.x, this.velocity.y, this.velocity.z);

    if (v > 1) {
      this.velocity.x /= v; this.velocity.y /= v; this.velocity.z /= v;
    }
    

    this.position.x += 0.4 * this.velocity.x;
    this.position.y += 0.4 * this.velocity.y;
    this.position.z += 0.4 * this.velocity.z
  }
}

function createSimulator(bodyCount) {
  let bodies = [];
  for (let i = 0; i < bodyCount; ++i) {
    let body = new Body();
    let a = (i / bodyCount) * 2 * Math.PI;
    body.position.x = 15 * Math.cos(a);
    body.position.y = 15 * Math.sin(a);
    body.position.z = 15 * Math.sin(a);
    bodies.push(body)
  }

  return {
    updatedForces,
    bodies,
    getAverageLength
  }

  function getAverageLength() {
    let sum = 0;
    for (let j = 0; j < bodyCount; ++j) {
      let p = bodies[j].position;
      sum += Math.hypot(p.x, p.y, p.z);
    }
    return sum / bodyCount;
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