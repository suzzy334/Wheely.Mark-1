import * as THREE from 'three';
import gsap from 'gsap';

export class WheelchairKinematics {
  constructor(wheelchairBase, electricComponents) {
    this.base = wheelchairBase;
    this.components = electricComponents;

    // Kinematic specifications
    this.wheelRadius = 0.305; // 24" wheel radius = 305mm
    this.casterRadius = 0.10; // 8" caster radius = 100mm
    this.trackWidth = wheelchairBase.dimensions.rearAxleX * 2; // ~0.55m
    this.gearRatio = 16 / 9; // 16T freewheel / 9T motor sprocket = 1.778 ratio
    this.maxSpeed = 2.2; // ~8 km/h max wheelchair speed
    this.maxTurnRate = 2.4; // rad/s

    // Dynamic states
    this.linearVelocity = 0; // m/s
    this.angularVelocity = 0; // rad/s
    this.leftSpeed = 0;
    this.rightSpeed = 0;

    // Wheel rotation angles
    this.leftWheelAngle = 0;
    this.rightWheelAngle = 0;
    this.leftMotorAngle = 0;
    this.rightMotorAngle = 0;

    // Front caster swivel angles
    this.leftCasterSwivelAngle = 0;
    this.rightCasterSwivelAngle = 0;

    // LiDAR rotation state (10 Hz = 600 RPM = 20*pi rad/s)
    this.lidarHeadAngle = 0;

    // Autonomous navigation simulation states
    this.autoMode = true; // Switch 1: true = AUTO, false = MANUAL
    this.sportMode = false; // Switch 2: true = SPORT (8 km/h), false = ECO (4 km/h)
    this.contactorClosed = true; // 24V contactor state
    this.eStopTripped = false;
    this.cliffDetected = false;
    this.obstacleDetected = false;
    this.obstacleDistance = 4.2; // meters ahead
    this.floorDistance = 0.42; // meters (VL53L1X downward reading)

    // Horn state
    this.hornActive = false;

    // Exploded view progression (0 = fully assembled, 1 = fully exploded)
    this.explodedProgress = 0;

    // Folding progression (0 = open 66cm, 1 = folded 23cm)
    this.foldingProgress = 0;

    // Cache initial assembled transforms for exploded assembly interpolation
    this.initExplodedStates();
  }

  initExplodedStates() {
    this.explodedParts = [
      {
        object: this.base.leftRearWheel,
        basePos: this.base.leftRearWheel ? this.base.leftRearWheel.position.clone() : new THREE.Vector3(),
        explodeOffset: new THREE.Vector3(0.28, 0, 0),
        name: "Left 24-inch Mag Wheel & 16T Freewheel"
      },
      {
        object: this.base.rightRearWheel,
        basePos: this.base.rightRearWheel ? this.base.rightRearWheel.position.clone() : new THREE.Vector3(),
        explodeOffset: new THREE.Vector3(-0.28, 0, 0),
        name: "Right 24-inch Mag Wheel & 16T Freewheel"
      },
      {
        object: this.components.leftMotorAssembly,
        basePos: this.components.leftMotorAssembly.position.clone(),
        explodeOffset: new THREE.Vector3(0.16, 0.08, 0.14),
        name: "Left MY1016Z Geared DC Motor & 9T Sprocket"
      },
      {
        object: this.components.rightMotorAssembly,
        basePos: this.components.rightMotorAssembly.position.clone(),
        explodeOffset: new THREE.Vector3(-0.16, 0.08, 0.14),
        name: "Right MY1016Z Geared DC Motor & 9T Sprocket"
      },
      {
        object: this.components.bracketsGroup,
        basePos: this.components.bracketsGroup.position.clone(),
        explodeOffset: new THREE.Vector3(0, -0.12, 0.10),
        name: "Custom Slotted Frame Tube Clamp Brackets"
      },
      {
        object: this.components.chainsGroup,
        basePos: this.components.chainsGroup.position.clone(),
        explodeOffset: new THREE.Vector3(0, 0, 0.22),
        name: "Heavy-Duty #410 Roller Chains"
      },
      {
        object: this.components.mainBatteryGroup,
        basePos: this.components.mainBatteryGroup.position.clone(),
        explodeOffset: new THREE.Vector3(0, -0.22, 0),
        name: "24V 30Ah 7S Li-ion Battery & Daly 40A BMS"
      },
      {
        object: this.components.motorDriversGroup,
        basePos: this.components.motorDriversGroup.position.clone(),
        explodeOffset: new THREE.Vector3(0, 0.16, 0.12),
        name: "Dual >=36V H-Bridge Motor Drivers & Bulk Caps"
      },
      (this.components.controllerBrainGroup || this.components.esp32BrainGroup) ? {
        object: (this.components.controllerBrainGroup || this.components.esp32BrainGroup),
        basePos: (this.components.controllerBrainGroup || this.components.esp32BrainGroup).position.clone(),
        explodeOffset: new THREE.Vector3(0, 0.22, -0.08),
        name: "ESP32-S3 DevKitC-1 & MPU6050 IMU"
      } : null,
      {
        object: this.components.lidarGroup,
        basePos: this.components.lidarGroup.position.clone(),
        explodeOffset: new THREE.Vector3(0, 0.25, 0.18),
        name: "LDROBOT STL-19P 360-degree LiDAR"
      },
      {
        object: this.components.vl53l1xGroup,
        basePos: this.components.vl53l1xGroup.position.clone(),
        explodeOffset: new THREE.Vector3(0, -0.14, 0.16),
        name: "Adafruit VL53L1X Downward Cliff Sensor"
      },
      (this.components.contactorSafetyGroup || this.components.contactorGroup) ? {
        object: (this.components.contactorSafetyGroup || this.components.contactorGroup),
        basePos: (this.components.contactorSafetyGroup || this.components.contactorGroup).position.clone(),
        explodeOffset: new THREE.Vector3(0.15, 0.15, 0.05),
        name: "24V DC Contactor & Emergency Stop System"
      } : null
    ].filter(Boolean);
  }

  setExplodedView(progress) {
    this.explodedProgress = THREE.MathUtils.clamp(progress, 0, 1);
    this.explodedParts.forEach(part => {
      if (part.object) {
        part.object.position.lerpVectors(
          part.basePos,
          part.basePos.clone().add(part.explodeOffset),
          this.explodedProgress
        );
      }
    });
  }

  setFoldingProgress(progress) {
    this.foldingProgress = THREE.MathUtils.clamp(progress, 0, 1);
    if (this.base.setFoldingProgress) {
      this.base.setFoldingProgress(this.foldingProgress);
    }
    // Also adapt battery cradle width/scale if in folding mode
    if (this.base.mode === 'folding') {
      const p = this.foldingProgress;
      if (this.components.mainBatteryGroup) {
        // Battery cradle pivots down slightly or narrows
        const baseY = this.components.anchors ? (this.components.anchors.batteryTrayY || 0.16) : 0.16;
        this.components.mainBatteryGroup.position.y = baseY - p * 0.04;
      }
      if (this.components.motorDriversGroup) {
        const baseDY = this.components.anchors ? (this.components.anchors.driverY || 0.44) : 0.44;
        this.components.motorDriversGroup.position.y = baseDY - p * 0.05;
      }
    }
  }

  triggerHorn(active) {
    this.hornActive = active;
    // Animate visual horn soundwave if available
    if (this.components.auxHornGroup) {
      this.components.auxHornGroup.children.forEach(c => {
        if (c.material && c.material.emissive) {
          c.material.emissive.setHex(active ? 0xffaa00 : 0x000000);
        }
      });
    }
  }

  toggleEStop() {
    this.eStopTripped = !this.eStopTripped;
    this.contactorClosed = !this.eStopTripped && !this.cliffDetected;
    return this.eStopTripped;
  }

  setSimulatedObstacle(detected) {
    this.obstacleDetected = detected;
    this.obstacleDistance = detected ? 0.8 : 4.2;
  }

  setSimulatedCliff(detected) {
    this.cliffDetected = detected;
    this.floorDistance = detected ? 0.85 : 0.42; // normal is ~42cm, cliff is > 80cm!
    if (detected) {
      // Automatic safety drop of contactor!
      this.contactorClosed = false;
    } else if (!this.eStopTripped) {
      this.contactorClosed = true;
    }
  }

  // Smoothly mount a specific component group into place
  mountComponent(componentKey, onComplete) {
    const part = this.explodedParts.find(p => p.object && p.object.name.toLowerCase().includes(componentKey.toLowerCase()));
    if (!part) return;

    part.object.position.copy(part.basePos.clone().add(part.explodeOffset.clone().multiplyScalar(0.8)));
    gsap.to(part.object.position, {
      x: part.basePos.x,
      y: part.basePos.y,
      z: part.basePos.z,
      duration: 1.2,
      ease: "back.out(1.4)",
      onComplete: () => {
        if (onComplete) onComplete(part.name);
      }
    });
  }

  // Drive update called per frame
  update(delta, input = { throttle: 0, steer: 0 }, isDriveMode = false) {
    // 1. Spin LDROBOT STL-19P LiDAR Head at 10 Hz continuously (62.8 rad/s)
    if (this.components.lidarGroup && this.components.lidarGroup.userData.head) {
      this.lidarHeadAngle += 62.8 * delta;
      this.components.lidarGroup.userData.head.rotation.y = this.lidarHeadAngle;

      // Pulse scanning laser plane opacity slightly for dynamic radar effect
      if (this.components.lidarGroup.userData.laserPlane) {
        const pulse = 0.20 + Math.sin(this.lidarHeadAngle * 0.5) * 0.06;
        this.components.lidarGroup.userData.laserPlane.material.opacity = pulse;
      }
    }

    // 2. Check Safety Interlocks (Contactor / E-Stop / Cliff)
    if (!this.contactorClosed || this.eStopTripped || this.cliffDetected) {
      // Power isolated physically!
      this.linearVelocity *= 0.8;
      this.angularVelocity *= 0.8;
    } else if (isDriveMode) {
      const topSpeed = this.sportMode ? this.maxSpeed : this.maxSpeed * 0.55;

      if (this.autoMode) {
        // AUTONOMOUS NAVIGATION SIMULATION
        if (this.obstacleDetected) {
          // Obstacle detected by LiDAR: slow down and execute autonomous avoidance turn!
          const targetV = 0.2;
          const targetOmega = 1.4; // smooth steer right to avoid
          this.linearVelocity = THREE.MathUtils.lerp(this.linearVelocity, targetV, 0.1);
          this.angularVelocity = THREE.MathUtils.lerp(this.angularVelocity, targetOmega, 0.12);
        } else {
          // Normal autonomous patrol / waypoint forward cruising
          const targetV = topSpeed * 0.65;
          const targetOmega = Math.sin(performance.now() * 0.001) * 0.2; // gentle path correction
          this.linearVelocity = THREE.MathUtils.lerp(this.linearVelocity, targetV, 0.08);
          this.angularVelocity = THREE.MathUtils.lerp(this.angularVelocity, targetOmega, 0.08);
        }
      } else {
        // MANUAL OVERRIDE (Keyboard / Touchpad)
        const targetV = input.throttle * topSpeed;
        const targetOmega = -input.steer * this.maxTurnRate;
        this.linearVelocity = THREE.MathUtils.lerp(this.linearVelocity, targetV, 0.12);
        this.angularVelocity = THREE.MathUtils.lerp(this.angularVelocity, targetOmega, 0.15);
      }
    } else {
      // In static inspection mode, gently decelerate
      this.linearVelocity *= 0.85;
      this.angularVelocity *= 0.85;
    }

    // Differential steering equations
    this.leftSpeed = this.linearVelocity - (this.angularVelocity * this.trackWidth / 2);
    this.rightSpeed = this.linearVelocity + (this.angularVelocity * this.trackWidth / 2);

    // Update wheel rotations
    const dLeftAngle = (this.leftSpeed / this.wheelRadius) * delta;
    const dRightAngle = (this.rightSpeed / this.wheelRadius) * delta;

    this.leftWheelAngle += dLeftAngle;
    this.rightWheelAngle += dRightAngle;

    if (this.base.leftRearWheel) this.base.leftRearWheel.rotation.x = this.leftWheelAngle;
    if (this.base.rightRearWheel) this.base.rightRearWheel.rotation.x = this.rightWheelAngle;

    // Motor output sprockets rotate with gear ratio
    this.leftMotorAngle += dLeftAngle * this.gearRatio;
    this.rightMotorAngle += dRightAngle * this.gearRatio;

    if (this.components.leftMotorAssembly.userData.sprocket) {
      this.components.leftMotorAssembly.userData.sprocket.rotation.x = this.leftMotorAngle;
    }
    if (this.components.rightMotorAssembly.userData.sprocket) {
      this.components.rightMotorAssembly.userData.sprocket.rotation.x = this.rightMotorAngle;
    }

    // Swivel front casters naturally towards velocity vector
    let targetCasterSwivel = 0;
    if (Math.abs(this.linearVelocity) > 0.05 || Math.abs(this.angularVelocity) > 0.05) {
      targetCasterSwivel = Math.atan2(this.angularVelocity * 0.35, Math.abs(this.linearVelocity) + 0.1);
    }
    this.leftCasterSwivelAngle = THREE.MathUtils.lerp(this.leftCasterSwivelAngle, targetCasterSwivel, 0.1);
    this.rightCasterSwivelAngle = THREE.MathUtils.lerp(this.rightCasterSwivelAngle, targetCasterSwivel, 0.1);

    if (this.base.leftCasterSwivel) this.base.leftCasterSwivel.rotation.y = this.leftCasterSwivelAngle;
    if (this.base.rightCasterSwivel) this.base.rightCasterSwivel.rotation.y = this.rightCasterSwivelAngle;

    // Return live telemetry
    return {
      speedKmH: Math.abs(this.linearVelocity * 3.6).toFixed(1),
      leftRpm: Math.round((Math.abs(this.leftSpeed) / (2 * Math.PI * this.wheelRadius)) * 60 * this.gearRatio),
      rightRpm: Math.round((Math.abs(this.rightSpeed) / (2 * Math.PI * this.wheelRadius)) * 60 * this.gearRatio),
      wheelRpm: Math.round(((Math.abs(this.leftSpeed) + Math.abs(this.rightSpeed)) / 2 / (2 * Math.PI * this.wheelRadius)) * 60),
      currentDrawAmps: this.contactorClosed
        ? (2.8 + Math.abs(this.linearVelocity) * 7.5 + Math.abs(this.angularVelocity) * 5.2).toFixed(1)
        : "0.0 (OFF)",
      batteryVoltage: (25.9 - (Math.abs(this.linearVelocity) * 0.6)).toFixed(1),
      contactorState: this.contactorClosed ? "CLOSED (24V ACTIVE)" : "OPEN (ISOLATED)",
      eStopState: this.eStopTripped ? "TRIPPED" : "ARMED",
      autoModeState: this.autoMode ? "AUTONOMOUS (SLAM/NAV)" : "MANUAL OVERRIDE",
      speedProfile: this.sportMode ? "SPORT (8 km/h)" : "ECO (4 km/h)",
      lidarDistanceM: this.obstacleDistance.toFixed(2),
      cliffReadingCm: (this.floorDistance * 100).toFixed(0),
      cliffStatus: this.cliffDetected ? "CLIFF / STAIR ALERT" : "CLEAR (42 cm)"
    };
  }
}
