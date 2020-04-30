class Vector {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  addScaledDifference(a, b, scale) {
    this.x += (a.x - b.x) * scale;
    this.y += (a.y - b.y) * scale;
    this.z += (a.z - b.z) * scale;
  }

  add(b) {
    this.x += b.x;
    this.y += b.y;
    this.z += b.z;
  }
}

class Body {
  constructor() {
    this.position = new Vector();
    this.force = new Vector();
    this.velocity = new Vector();
  }
  reset() {
    this.force.reset();
  }

  applyForce(other) {
    let distance = this.position.distanceTo(other.position); 
    if (distance < 1e-5) {
      this.position.x += 0.5
      return this.applyForce(other);
    }
    this.force.addScaledDifference(other.position, this.position, 1/(
      distance*distance*distance))
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

module.exports = function createSimulator(bodyCount) {
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
    let sum = new Vector();
    for (let j = 0; j < bodyCount; ++j) {
      let srcBody = bodies[j];
      sum.add(srcBody.position);
    }
    return Math.hypot(sum.x/bodyCount, sum.y/bodyCount, sum.z/bodyCount);
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