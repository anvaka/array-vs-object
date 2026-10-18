// Instead of giving each body its own small arrays, all bodies share three
// flat buffers. A body is identified by its offset into them (3 * bodyNumber).

function distanceTo(positions, a, b) {
  let dx = positions[a + 0] - positions[b + 0];
  let dy = positions[a + 1] - positions[b + 1];
  let dz = positions[a + 2] - positions[b + 2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function addScaledDifference(out, outIndex, positions, a, b, scale) {
  out[outIndex + 0] += (positions[a + 0] - positions[b + 0]) * scale;
  out[outIndex + 1] += (positions[a + 1] - positions[b + 1]) * scale;
  out[outIndex + 2] += (positions[a + 2] - positions[b + 2]) * scale;
}

function createSimulator(bodyCount) {
  let positions = new Float64Array(bodyCount * 3);
  let forces = new Float64Array(bodyCount * 3);
  let velocities = new Float64Array(bodyCount * 3);
  for (let i = 0; i < bodyCount; ++i) {
    let a = (i / bodyCount) * 2 * Math.PI;
    positions[3 * i + 0] = 15 * Math.cos(a);
    positions[3 * i + 1] = 15 * Math.sin(a);
    positions[3 * i + 2] = 15 * Math.sin(a);
  }

  return {
    updatedForces,
    positions,
    getAverageLength
  }

  function getAverageLength() {
    let sum = 0;
    for (let j = 0; j < bodyCount * 3; j += 3) {
      sum += Math.hypot(positions[j + 0], positions[j + 1], positions[j + 2]);
    }
    return sum / bodyCount;
  }

  function applyForce(body, other) {
    let distance = distanceTo(positions, body, other);
    if (distance < 1e-5) {
      positions[body] += 0.5
      return applyForce(body, other);
    }

    addScaledDifference(forces, body, positions, other, body, 1/(
      distance*distance*distance));
  }

  function updatePosition(body) {
    let timeStep = 0.01;
    velocities[body + 0] += timeStep * forces[body + 0];
    velocities[body + 1] += timeStep * forces[body + 1];
    velocities[body + 2] += timeStep * forces[body + 2];
    let v = Math.hypot(velocities[body + 0], velocities[body + 1], velocities[body + 2]);

    if (v > 1) {
      velocities[body + 0] /= v; velocities[body + 1] /= v; velocities[body + 2] /= v;
    }

    positions[body + 0] += 0.4 * velocities[body + 0];
    positions[body + 1] += 0.4 * velocities[body + 1];
    positions[body + 2] += 0.4 * velocities[body + 2];
  }

  function updatedForces() {
    for (let j = 0; j < bodyCount * 3; j += 3) {
      forces[j + 0] = 0;
      forces[j + 1] = 0;
      forces[j + 2] = 0;
      for (let k = 0; k < bodyCount * 3; k += 3) {
        if (k === j) continue;
        applyForce(j, k);
      }
    }
    for (let j = 0; j < bodyCount * 3; j += 3) {
      updatePosition(j);
    }
  }
}

module.exports = createSimulator;
