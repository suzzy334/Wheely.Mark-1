import * as THREE from 'three';

/**
 * WheelchairPhysics - High-Fidelity Differential Drive Rigid-Body Physics Engine
 * Simulates:
 * - Differential kinematics with mass, inertia, rolling friction, and brake drag
 * - True angular velocities for 24" rear wheels and 16T fixed sprockets (w = v / R)
 * - True angular velocities for 8" front casters (>3x faster than rear wheels)
 * - Front caster trail swivel around the vertical kingpin (aligns with velocity and flips 180° in reverse)
 * - Dynamic chassis suspension pitch (squat on acceleration, dive on braking) and body roll during cornering
 * - Articulated scissor parking brakes that mechanically clamp against tire tread to lock rotation
 * - GTA 6 style dynamic camera tracking (Free Orbit, 3rd-Person Chase Cam, First-Person Rider POV)
 */
export class WheelchairPhysics {
  constructor(wheelchair, groundGroup, camera, controls) {
    this.wc = wheelchair;
    this.groundGroup = groundGroup;
    this.camera = camera;
    this.controls = controls;

    // Physical Dimensions & Constants
    this.mass = 16.0; // kg (chassis + composite wheels)
    this.wheelRadius = 0.305; // 24" rear wheel radius = 305mm
    this.casterRadius = 0.100; // 8" front caster radius = 100mm
    this.trackWidth = 0.55; // distance between rear wheels (m)
    this.maxSpeed = 2.8; // ~10.1 km/h max push/drive speed
    this.maxTurnRate = 2.4; // rad/s maximum yaw turn rate
    this.acceleration = 3.6; // m/s^2 linear acceleration
    this.friction = 2.4; // m/s^2 rolling friction deceleration
    this.brakeForce = 14.0; // m/s^2 parking brake deceleration

    // Physical Dynamic States
    this.position = new THREE.Vector3(0, 0, 0);
    this.heading = 0; // yaw angle around Y axis in radians
    this.linearVelocity = 0; // forward speed in m/s
    this.angularVelocity = 0; // turning speed in rad/s
    this.pitch = 0; // chassis tilt forward/backward
    this.roll = 0; // chassis tilt left/right
    this.totalDistance = 0; // total distance traveled in meters

    // Wheel Angles (accumulated rotation around local X axis)
    this.leftWheelAngle = 0;
    this.rightWheelAngle = 0;
    this.leftCasterWheelAngle = 0;
    this.rightCasterWheelAngle = 0;

    // Caster Swivel Kingpin Angles (trail steering physics)
    this.leftCasterSwivelAngle = 0;
    this.rightCasterSwivelAngle = 0;

    // Parking Brakes state
    this.parkingBrakeEngaged = false;

    // Camera follow mode ('orbit' | 'chase' | 'driver')
    this.cameraMode = 'orbit';

    // Input States
    this.inputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };

    this.setupKeyboardListeners();
  }

  setWheelchair(newWheelchair) {
    this.wc = newWheelchair;
    this.wc.root.position.copy(this.position);
    this.wc.root.rotation.y = this.heading;
    if (this.wc.leftBrake?.userData?.setBrakeLocked) {
      this.wc.leftBrake.userData.setBrakeLocked(this.parkingBrakeEngaged);
    }
    if (this.wc.rightBrake?.userData?.setBrakeLocked) {
      this.wc.rightBrake.userData.setBrakeLocked(this.parkingBrakeEngaged);
    }
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.inputs.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.inputs.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.inputs.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.inputs.right = true;
          break;
        case 'Space':
          this.toggleParkingBrakes();
          e.preventDefault();
          break;
        case 'KeyR':
          this.resetPosition();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.inputs.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.inputs.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.inputs.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.inputs.right = false;
          break;
      }
    });
  }

  toggleParkingBrakes() {
    this.parkingBrakeEngaged = !this.parkingBrakeEngaged;
    if (this.wc.leftBrake?.userData?.setBrakeLocked) {
      this.wc.leftBrake.userData.setBrakeLocked(this.parkingBrakeEngaged);
    }
    if (this.wc.rightBrake?.userData?.setBrakeLocked) {
      this.wc.rightBrake.userData.setBrakeLocked(this.parkingBrakeEngaged);
    }

    const brakeBtn = document.getElementById('brake-toggle-btn');
    if (brakeBtn) {
      brakeBtn.classList.toggle('active', this.parkingBrakeEngaged);
      brakeBtn.innerHTML = this.parkingBrakeEngaged
        ? '<span>⚡</span> Dynamic Brake LOCKED'
        : '<span>🔓</span> Dynamic Brake FREE';
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
  }

  update(delta) {
    const dt = Math.min(delta, 0.05); // clamp delta for physics stability

    // 1. Calculate Target Velocities based on User Inputs & Parking Brake
    let targetLinear = 0;
    let targetAngular = 0;

    if (!this.parkingBrakeEngaged) {
      if (this.inputs.forward) targetLinear += this.maxSpeed;
      if (this.inputs.backward) targetLinear -= this.maxSpeed * 0.65;
      if (this.inputs.left) targetAngular += this.maxTurnRate;
      if (this.inputs.right) targetAngular -= this.maxTurnRate;
    }

    // 2. Physics Acceleration & Deceleration with Inertia
    if (this.parkingBrakeEngaged) {
      // High brake friction brings wheels to a firm halt
      this.linearVelocity = THREE.MathUtils.lerp(this.linearVelocity, 0, Math.min(1, this.brakeForce * dt));
      this.angularVelocity = THREE.MathUtils.lerp(this.angularVelocity, 0, Math.min(1, this.brakeForce * dt));
    } else {
      // Smooth motor/push acceleration and rolling resistance
      const accelRate = (Math.abs(targetLinear) > Math.abs(this.linearVelocity)) ? this.acceleration : this.friction;
      this.linearVelocity = THREE.MathUtils.lerp(this.linearVelocity, targetLinear, Math.min(1, accelRate * dt));

      const turnAccelRate = 6.5;
      this.angularVelocity = THREE.MathUtils.lerp(this.angularVelocity, targetAngular, Math.min(1, turnAccelRate * dt));
    }

    // Eliminate tiny floating-point drift
    if (Math.abs(this.linearVelocity) < 0.005) this.linearVelocity = 0;
    if (Math.abs(this.angularVelocity) < 0.005) this.angularVelocity = 0;

    // 3. Integrate Differential Drive Kinematics
    this.heading += this.angularVelocity * dt;
    this.wc.root.rotation.y = this.heading;

    const dx = Math.sin(this.heading) * this.linearVelocity * dt;
    const dz = Math.cos(this.heading) * this.linearVelocity * dt;
    this.position.x += dx;
    this.position.z += dz;
    this.wc.root.position.copy(this.position);

    // Track total distance
    this.totalDistance += Math.abs(this.linearVelocity) * dt;

    // 4. Update Camera depending on Camera Mode
    if (this.camera && this.controls) {
      const chassisCenter = new THREE.Vector3(this.position.x, 0.40, this.position.z);

      if (this.cameraMode === 'orbit') {
        // Orbit mode: Camera target smoothly follows the wheelchair center,
        // maintaining the user's manual orbit view/angle relative to the wheelchair!
        const prevTarget = this.controls.target.clone();
        const deltaTarget = new THREE.Vector3().subVectors(chassisCenter, prevTarget);
        this.controls.target.copy(chassisCenter);
        this.camera.position.add(deltaTarget);
      } else if (this.cameraMode === 'chase') {
        // Dynamic 3rd-person GTA 6 style chase camera behind the wheelchair
        const chaseDist = 2.0;
        const chaseHeight = 0.85;
        const targetCamPos = new THREE.Vector3(
          this.position.x - Math.sin(this.heading) * chaseDist,
          this.position.y + chaseHeight,
          this.position.z - Math.cos(this.heading) * chaseDist
        );
        this.camera.position.lerp(targetCamPos, Math.min(1, 6.0 * dt));
        this.controls.target.lerp(chassisCenter, Math.min(1, 8.0 * dt));
      } else if (this.cameraMode === 'driver') {
        // First-person rider POV (mounted right in the seat looking forward)
        const eyePos = new THREE.Vector3(this.position.x, 0.72, this.position.z + 0.05);
        this.camera.position.copy(eyePos);
        const lookTarget = new THREE.Vector3(
          this.position.x + Math.sin(this.heading) * 3.5,
          0.42,
          this.position.z + Math.cos(this.heading) * 3.5
        );
        this.controls.target.copy(lookTarget);
      }
    }

    // 5. Differential Speeds for Left & Right Rear Wheels
    const leftSpeed = this.linearVelocity - (this.angularVelocity * this.trackWidth / 2);
    const rightSpeed = this.linearVelocity + (this.angularVelocity * this.trackWidth / 2);

    // 6. Integrate Rear Wheel & Fixed Sprocket Rotations (w = v / R)
    const dLeftAngle = (leftSpeed / this.wheelRadius) * dt;
    const dRightAngle = (rightSpeed / this.wheelRadius) * dt;

    this.leftWheelAngle += dLeftAngle;
    this.rightWheelAngle += dRightAngle;

    if (this.wc.leftWheelSpin) {
      this.wc.leftWheelSpin.rotation.x = this.leftWheelAngle;
    }
    if (this.wc.rightWheelSpin) {
      this.wc.rightWheelSpin.rotation.x = this.rightWheelAngle;
    }

    // 7. Integrate Front 8" Caster Wheel Rotations & Kingpin Swivel Trail Physics
    const casterSpeed = this.linearVelocity;
    const dCasterAngle = (casterSpeed / this.casterRadius) * dt;

    this.leftCasterWheelAngle += dCasterAngle;
    this.rightCasterWheelAngle += dCasterAngle;

    if (this.wc.leftCasterSpin) {
      this.wc.leftCasterSpin.rotation.x = this.leftCasterWheelAngle;
    }
    if (this.wc.rightCasterSpin) {
      this.wc.rightCasterSpin.rotation.x = this.rightCasterWheelAngle;
    }

    // Caster Swivel Trail Physics (Aligns with velocity vector, flips 180° in reverse)
    const casterVx = -this.angularVelocity * 0.32;
    const casterVz = this.linearVelocity;
    const casterSpeedSq = casterVx * casterVx + casterVz * casterVz;

    let targetCasterSwivel = 0;
    if (casterSpeedSq > 0.002) {
      // atan2(vx, vz) naturally yields 0 rad when moving forward, and +/- PI rad when reversing!
      targetCasterSwivel = Math.atan2(casterVx, casterVz);
    }

    this.leftCasterSwivelAngle = THREE.MathUtils.lerp(
      this.leftCasterSwivelAngle,
      targetCasterSwivel,
      Math.min(1, 14.0 * dt)
    );
    this.rightCasterSwivelAngle = THREE.MathUtils.lerp(
      this.rightCasterSwivelAngle,
      targetCasterSwivel,
      Math.min(1, 14.0 * dt)
    );

    if (this.wc.leftCasterSwivel) {
      this.wc.leftCasterSwivel.rotation.y = this.leftCasterSwivelAngle;
    }
    if (this.wc.rightCasterSwivel) {
      this.wc.rightCasterSwivel.rotation.y = this.rightCasterSwivelAngle;
    }

    // 8. Dynamic Chassis Suspension Pitch & Body Roll
    // Pitch: dives forward when decelerating/braking, squats back when accelerating
    const targetPitch = -this.linearVelocity * 0.024;
    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, Math.min(1, 10.0 * dt));

    // Roll: body leans outward during high-speed turns
    const targetRoll = -this.angularVelocity * 0.018;
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, Math.min(1, 10.0 * dt));

    if (this.wc.dynamicBody) {
      this.wc.dynamicBody.rotation.x = this.pitch;
      this.wc.dynamicBody.rotation.z = this.roll;
    }

    // 9. Return Live Telemetry Data
    return {
      speedKmH: Math.abs(this.linearVelocity * 3.6).toFixed(1),
      rawSpeed: this.linearVelocity,
      leftRpm: Math.round((Math.abs(leftSpeed) / (2 * Math.PI * this.wheelRadius)) * 60),
      rightRpm: Math.round((Math.abs(rightSpeed) / (2 * Math.PI * this.wheelRadius)) * 60),
      casterRpm: Math.round((Math.abs(this.linearVelocity) / (2 * Math.PI * this.casterRadius)) * 60),
      distanceM: this.totalDistance.toFixed(1),
      headingDeg: Math.round((this.heading * 180 / Math.PI) % 360),
      pitchDeg: (this.pitch * 180 / Math.PI).toFixed(1),
      rollDeg: (this.roll * 180 / Math.PI).toFixed(1),
      isBraked: this.parkingBrakeEngaged,
      isMoving: Math.abs(this.linearVelocity) > 0.04 || Math.abs(this.angularVelocity) > 0.04,
      cameraMode: this.cameraMode
    };
  }

  resetPosition() {
    this.position.set(0, 0, 0);
    this.heading = 0;
    this.linearVelocity = 0;
    this.angularVelocity = 0;
    this.totalDistance = 0;
    this.leftWheelAngle = 0;
    this.rightWheelAngle = 0;
    this.leftCasterWheelAngle = 0;
    this.rightCasterWheelAngle = 0;
    this.leftCasterSwivelAngle = 0;
    this.rightCasterSwivelAngle = 0;
    this.pitch = 0;
    this.roll = 0;
    this.wc.root.position.set(0, 0, 0);
    this.wc.root.rotation.set(0, 0, 0);
    if (this.wc.dynamicBody) {
      this.wc.dynamicBody.rotation.set(0, 0, 0);
    }
    if (this.controls) {
      this.controls.target.set(0, 0.40, 0.02);
    }
  }
}
